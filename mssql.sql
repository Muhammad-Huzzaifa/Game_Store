CREATE TABLE games (
    game_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    genre NVARCHAR(100),
    platform NVARCHAR(100),
    developer NVARCHAR(100),
    publisher NVARCHAR(100),
    release_date DATE,
    price DECIMAL(10, 2) NOT NULL CHECK(price >= 0),
    cover_image NVARCHAR(500) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1
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

CREATE TABLE discount_codes (
    discount_code_id INT PRIMARY KEY IDENTITY(1,1),
    code NVARCHAR(20) NOT NULL UNIQUE,
    discount_percentage INT NOT NULL CHECK (discount_percentage BETWEEN 1 AND 100),
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    CHECK (valid_to > valid_from)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    order_date DATETIME DEFAULT GETDATE(),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status NVARCHAR(50) NOT NULL CHECK (status IN ('Processing', 'Shipped', 'Delivered')),
    discount_code_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    FOREIGN KEY (discount_code_id) REFERENCES discount_codes(discount_code_id)
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