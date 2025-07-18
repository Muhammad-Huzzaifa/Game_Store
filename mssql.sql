CREATE TABLE discount_codes (
    discount_code_id INT PRIMARY KEY IDENTITY(1,1),
    code NVARCHAR(20) NOT NULL UNIQUE,
    discount_percentage INT NOT NULL CHECK (discount_percentage BETWEEN 1 AND 100),
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    CHECK (valid_to > valid_from)
);

CREATE TABLE games (
    game_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    platform NVARCHAR(100),
    developer NVARCHAR(100),
    publisher NVARCHAR(100),
    release_date DATE,
    price DECIMAL(10, 2) NOT NULL CHECK(price >= 0),
    cover_image NVARCHAR(500) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    discount_code_id INT NULL,
    FOREIGN KEY (discount_code_id) REFERENCES discount_codes(discount_code_id)
);

CREATE TABLE genres (
    ganre_id INT IDENTITY(1,1) PRIMARY KEY,
    game_id INT NOT NULL,
    genre NVARCHAR(50) NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT uq_game_genre UNIQUE (game_id, genre)
);

CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY IDENTITY(1,1),
    game_id INT UNIQUE NOT NULL,
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE TABLE carts (
    cart_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id INT PRIMARY KEY IDENTITY(1,1),
    cart_id INT NOT NULL,
    game_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id),
    CONSTRAINT uq_cart_game UNIQUE (cart_id, game_id)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    order_date DATETIME DEFAULT GETDATE(),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status NVARCHAR(50) NOT NULL CHECK (status IN ('Processing', 'Shipped', 'Delivered')),
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
);

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    game_id INT NOT NULL,
    quantity INT NOT NULL CHECK (Quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id),
    CONSTRAINT uq_order_game UNIQUE (order_id, game_id)
);

CREATE TABLE payments (
    payment_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT UNIQUE NOT NULL,
    payment_date DATETIME DEFAULT GETDATE(),
    payment_status NVARCHAR(50) NOT NULL CHECK (payment_status IN ('Pending', 'Completed', 'Failed')),
    payment_method NVARCHAR(50) NOT NULL CHECK (payment_method IN ('Credit Card', 'Bank Transfer', 'Cash')),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Create a cart for customer after account creation
GO
CREATE TRIGGER trg_after_customer_insert
ON auth_user
AFTER INSERT
AS
BEGIN
	INSERT INTO carts (user_id)
	SELECT id
	FROM inserted
	WHERE is_staff=0 
		AND is_superuser=0;
END;
GO

-- Update quantity of cart item when added multiple times
GO
CREATE TRIGGER trg_merge_cart_item
ON cart_items
INSTEAD OF INSERT
AS
BEGIN
	UPDATE ci
	SET ci.quantity = ci.quantity + i.quantity
	FROM cart_items ci
	INNER JOIN inserted i
	ON ci.cart_id=i.cart_id
		AND ci.game_id=i.game_id;

	INSERT INTO cart_items (cart_id, game_id, quantity)
	SELECT i.cart_id, i.game_id, i.quantity
	FROM inserted i
	WHERE NOT EXISTS (
		SELECT 1
		FROM cart_items ci
		WHERE ci.cart_id=i.cart_id
			AND ci.game_id=i.game_id
	);
END;
GO

-- Create trigger for automating the order_items operations
GO
CREATE TRIGGER trg_order_items_insert
ON order_items
INSTEAD OF INSERT
AS
BEGIN
	IF EXISTS (
		SELECT 1
		FROM inserted i
		LEFT JOIN inventory inv
		ON i.game_id=inv.game_id
		WHERE inv.game_id IS NULL
	)
	BEGIN
		RAISERROR('One or more games do not exist in inventory.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
	END;

	IF EXISTS (
		SELECT 1
		FROM inserted i
		INNER JOIN inventory inv
		ON i.game_id=inv.game_id
		WHERE i.quantity > inv.stock_quantity
	)
	BEGIN
		RAISERROR('Insufficient stock for one or more games.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
	END;

	UPDATE inv
	SET inv.stock_quantity = inv.stock_quantity - i.quantity
	FROM inserted i
	INNER JOIN inventory inv
	ON i.game_id=inv.game_id;

	INSERT INTO order_items (order_id, game_id, quantity, price_at_purchase)
	SELECT i.order_id, i.game_id, i.quantity, g.price * (1 - COALESCE(CAST(dc.discount_percentage AS DECIMAL(5, 2)), 0)/100) AS discounted_price
	FROM inserted i
	INNER JOIN games g
	ON i.game_id=g.game_id
	LEFT JOIN discount_codes dc
	ON g.discount_code_id=dc.discount_code_id
		AND GETDATE() BETWEEN dc.valid_from AND dc.valid_to;

	UPDATE o
	SET o.total_amount = o.total_amount + c.total_price
	FROM orders o
	INNER JOIN (
		SELECT i.order_id, SUM(i.quantity * g.price * (1 - COALESCE(CAST(dc.discount_percentage AS DECIMAL(5,2)), 0)/100)) AS total_price
		FROM inserted i
		INNER JOIN games g
		ON i.game_id=g.game_id
		LEFT JOIN discount_codes dc
		ON g.discount_code_id=dc.discount_code_id
			AND GETDATE() BETWEEN dc.valid_from AND dc.valid_to
		GROUP BY i.order_id
	) AS c
	ON o.order_id=c.order_id;
END;
GO

-- After insert trigger on orders
GO
CREATE TRIGGER trg_after_insert_order
ON orders
AFTER INSERT
AS
BEGIN
	INSERT INTO order_items (order_id, game_id, quantity, price_at_purchase)
	SELECT i.order_id, ci.game_id, ci.quantity, 0
	FROM inserted i
	INNER JOIN carts c
	ON i.user_id=c.user_id
	INNER JOIN cart_items ci
	ON c.cart_id=ci.cart_id;

	DELETE ci
	FROM cart_items ci
	INNER JOIN carts c
	ON ci.cart_id=c.cart_id
	INNER JOIN inserted i
	ON c.user_id=i.user_id;

	INSERT INTO payments (order_id, payment_status, payment_method)
	SELECT order_id, 'Pending', 'Credit Card'
	FROM inserted;
END;
GO

-- Trigger on after inserting the game
GO
CREATE TRIGGER trg_game_after_insert
ON games
AFTER INSERT
AS
BEGIN
	INSERT INTO inventory (game_id, stock_quantity)
	SELECT game_id, 0
	FROM inserted;
END;
GO

-- Indexes
GO
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
GO
CREATE INDEX idx_discount_codes_valid_range ON discount_codes(valid_from, valid_to);
GO
CREATE INDEX idx_games_title ON games(title);
GO
CREATE INDEX idx_games_platform ON games(platform);
GO
CREATE INDEX idx_games_is_active ON games(is_active);
GO
CREATE INDEX idx_games_discount_code_id ON games(discount_code_id);
GO
CREATE INDEX idx_games_platform_price_active ON games(platform, price, is_active);
GO
CREATE INDEX idx_genres_game_id ON genres(game_id);
GO
CREATE INDEX idx_genres_game_genre ON genres(game_id, genre);
GO
CREATE INDEX idx_inventory_game_id ON inventory(game_id);
GO
CREATE INDEX idx_carts_user_id ON carts(user_id);
GO
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
GO
CREATE INDEX idx_cart_items_game_id ON cart_items(game_id);
GO
CREATE INDEX idx_cart_items_composite ON cart_items(cart_id, game_id);
GO
CREATE INDEX idx_orders_user_id ON orders(user_id);
GO
CREATE INDEX idx_orders_order_date ON orders(order_date);
GO
CREATE INDEX idx_orders_status ON orders(status);
GO
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
GO
CREATE INDEX idx_order_items_game_id ON order_items(game_id);
GO
CREATE INDEX idx_order_items_composite ON order_items(order_id, game_id);
GO
CREATE INDEX idx_payments_order_id ON payments(order_id);
GO
CREATE INDEX idx_payments_status_method ON payments(payment_status, payment_method);
GO