$(window).on('load', () => {
	$('.loader-flex-fix').fadeOut();
})
$(document).ready(() => {
	window.onerror = (message, url, line) => {
		console.log('Poruka: ' + message);
		console.log('URL: ' + url);
		console.log('Linija u kojoj je nastala greska: ' + line);
	}
	"use strict";

	const header = $('.header');
	const hamburger = $('.hamburger_container');
	const menu = $('.hamburger_menu');
	var menuActive = false;
	const hamburgerClose = $('.hamburger_close');
	const fsOverlay = $('.fs_menu_overlay');

	const location = window.location.pathname;
	var allGames;
	var degreesCat = 0, degreesPrice = 0, degreesMore = 0, degreesOther = 0;
	var maxItemsStore = 9;
	var filtered;
	var checkedCat = [];
	var checkedMode = [];
	var checkedOther = [];
	var priceTo = 60;
	var priceFrom = 0;
	var news = [];
	setHeader();
	initMenu();
	checkCookieNewsletter();
	checkCartAmount();
	getData('navigation', displayNav);
	if (location.indexOf("index") !== -1 || location == "/gamehut/" || location == '/') {
		getData('allGames', displayHomeSlider);
		getData('allGames', displayAllSections);
		getData('comingSoon', displayComingSoon);
		removePng();
		getTotal()
	}
	else if (location.indexOf("single") !== -1) {
		getData('allGames', displaySingle);
	}
	else if (location.indexOf("shop") !== -1) {
		getData('comingSoon', displayComingSoon);
		filterResponsive();
	}
	else if (location.indexOf("contact") !== -1) {
		const form = document.getElementById('contact');
		const fullName = document.getElementById('input_name');
		const mail = document.getElementById('input_email');
		const subject = document.getElementById('input_subject')
		const message = document.getElementById('input_message');
		var correctName = false, correctMail = false, correctSubject = false, correctMessage = false;
		const subjectReg = /^[A-ZŠĐČĆŽ][a-zšđčćžA-ZŠĐČĆŽ0-9-_ ]+$/;
		const messageLength = 20;

		fullName.onchange = () => {
			checkInputValues(fullName, 'name', fullNameReg, 'Name cannot be empty.', 'First name/last name must start with capital letter');
		};
		mail.onchange = () => {
			checkInputValues(mail, 'mail', mailReg, 'Mail cannot be empty.', 'Mail is not in a good format. (E.q: johndoe5@gmail.com)');
		};
		subject.onchange = () => {
			checkInputValues(subject, 'subject', subjectReg, 'Subject cannot be empty.', 'Subject must start with capital letter.');
		};
		message.onchange = () => {
			checkMessage();
		};
		form.onsubmit = (event) => {
			event.preventDefault();
			correctName = checkInputValues(fullName, 'name', fullNameReg, 'Name cannot be empty.', 'First name/last name must start with capital letter');
			correctMail = checkInputValues(mail, 'mail', mailReg, 'Mail cannot be empty.', 'Mail is not in a good format. (E.q: johndoe5@gmail.com)');
			correctSubject = checkInputValues(subject, 'subject', subjectReg, 'Subject cannot be empty.', 'Subject must start with capital letter.');
			correctMessage = checkMessage();
			if (correctName && correctMail && correctSubject && correctMessage) {
				let isSent = checkMessageCookie();
				if (isSent.val) {
					displayMessageModal(`You must wait ${isSent.msg} minutes to send another message.`);
				}
				else {
					displayMessageModal('You have successfully sent a message.');
					setMessageCookie('message', 'sent', 1);
				}
			}
		};
		function checkMessage() {
			let val = false;
			let err;
			if (message.value.length < messageLength) {
				if (!message.value.length) {
					err = 'Message cannot be empty.';
				}
				else {
					err = 'Message must contain at least 20 characters.';
				}
				$('.message').html(err);
				$(message).css('border', '2px solid #e21e21');
			}
			else {
				$(message).css('border', '2px solid green');
				$('.message').html('');
				val = true;
			}
			return val;
		}
		function setMessageCookie(name, value, duration) {
			let date = new Date();
			date.setUTCHours(date.getUTCHours() + duration);
			document.cookie = `${name}=${value}; expires=${date.toUTCString()}; secure`
			document.cookie = `msgTime=${date.toUTCString()}; expires=${date.toUTCString()}; secure`
		}
		function checkMessageCookie() {
			let cookie = document.cookie.split('; ').find(message => message.startsWith('message'));
			if (cookie) {
				let msgTime = document.cookie.split('; ').find(message => message.startsWith('msgTime'));
				let date = new Date(msgTime.split('=')[1]);
				let now = new Date();
				let difference = date.getTime() - now.getTime();
				let minutesLeft = Math.round(difference / 60000);
				return {
					val: true,
					msg: minutesLeft
				};
			}
			else {
				return false;
			}
		}
	}

	// Cart
	// else if(location.indexOf("cart") !== - 1){
	// 	displayCart();
	// 	getTotal();
	// 	function displayCart(){
	// 		if(localStorage.getItem('addedGame')){
	// 			let gamesList = JSON.parse(localStorage.getItem('addedGame'));
	// 			let cart = '';
	// 			for(let game of gamesList){
	// 				cart += ` <li class="my-2">
	// 		                        <div class="cart-item row m-0 py-3">
	// 		                            <div class="cart-item-img col-12 col-sm-4 col-md-3 d-flex justify-content-center align-items-center pb-3 pb-sm-0">
	// 		                                <a href="single.html" class="openSingle" data-id="${game.id}"><img src="${game.image}" alt="${game.name}" class="img-fluid"></a>
	// 		                            </div>
	// 		                            <div class="col-12 col-sm-8 col-md-9 d-flex flex-column ">
	// 			                            <div class="cart-item-name d-flex justify-content-start flex-row">
	// 			                                <p class="m-0">Name:</p><a href="single.html" class="openSingle" data-id="${game.id}"><h5 class="ml-2 game-name">${game.name}</h5></a>
	// 			                            </div>
	// 			                            <div class='d-flex justify-content-start flex-row'>
	// 											<p class="m-0">Price:</p><h5 class="ml-2"><i class="fas fa-euro-sign"></i> ${game.price}</h5>
	// 										</div>
	// 										<div class='d-flex justify-content-start flex-row'>
	// 											<p class="m-0">Quantity:</p>
	// 											<h5 class="ml-2 mb-0">${game.quantity}</h5>
	// 											<button type="button" data-quantity="raise" data-id="${game.id}" class="quantityBtn"><i class="fas fa-plus"></i></button>
	// 											<button type="button" data-quantity="lower" data-id="${game.id}" class="quantityBtn"><i class="fas fa-minus"></i></button>
	// 										</div>
	// 										<button type="button" class="removeGame d-flex justify-content-center align-items-center" data-id='${game.id}'><i class="fas fa-trash-alt d-block"></i></button>
	// 		                            </div>
	// 		                        </div>
	// 		                    </li>`
	// 			}
	// 			$('#games-list').html(cart);
	// 		}
	// 		else{
	// 			let text = "<li class='my-2'><div class=\"cart-item col-12 pt-4\"><h5>You have no games added into your cart.</h5><a href='shop.html'><button type='button' id='sendToShop'>Shop now!</button> </a></div></li>"
	// 			$('#games-list').html(text);
	// 			$('#bag').removeClass('col-md-8');
	// 			$('#summary').remove();
	// 		}
	// 	}
	// 	$(document).on('click', '.removeGame', function () {
	// 		var id = $(this).data('id');
	// 		let allAdded = JSON.parse(localStorage.getItem('addedGame'));
	// 		let afterRemoving = [];
	// 		for(let game of allAdded){
	// 			if(game.id != id){
	// 				afterRemoving.push(game);
	// 			}
	// 		}
	// 		if(afterRemoving.length){
	// 			localStorage.setItem('addedGame', JSON.stringify(afterRemoving));
	// 		}
	// 		else{
	// 			localStorage.removeItem('addedGame');
	// 		}
	// 		checkCartAmount();
	// 		displayCart();
	// 		getTotal();
	// 	})
	// 	$('[data-toggle="tooltip"]').tooltip();
	// 	$(document).on('click', '.quantityBtn', changeQuantity);
	// 	function changeQuantity(){
	// 		const minQuantity = 1;
	// 		const maxQuantity = 100;
	// 		const quantityData = $(this).data('quantity');
	// 		const gameId = $(this).data('id');
	// 		var games = JSON.parse(localStorage.getItem('addedGame'));
	// 		if(quantityData == 'raise'){
	// 			games.forEach((game) =>{
	// 				if(gameId == game.id){
	// 					if(game.quantity < maxQuantity){
	// 						game.quantity++;
	// 					}
	// 				}
	// 			})
	// 		}
	// 		else{
	// 			games.forEach((game) => {
	// 				if(gameId == game.id){
	// 					if(game.quantity > minQuantity){
	// 						game.quantity--;
	// 					}
	// 				}
	// 			})
	// 		}
	// 		localStorage.setItem('addedGame', JSON.stringify(games));
	// 		displayCart();
	// 		getTotal();
	// 	}
	// 	$('#checkoutOrder').on('submit', function (e){
	// 		e.preventDefault();
	// 		proveriUnosOrder();
	// 	});
	// }
	//endregion
	function proveriUnosOrder(){
		let name = $("#fullname");
		let email = $("#email");
		let card = $("#card");
		let cvv = $("#cvv");
		let date = $("#date");
		const cardReg = /^[5][0-9]{15}$/;
		const cvvReg = /^[0-9]{3}$/;
		const dateReg = /^([0][1-9]|[1-2][0-2])\/([2][1-6])$/;
		let brojGresaka = 0;
		if (!fullNameReg.test(name.val())) {
			if (!$('#nameErr').length) {
				let err = "<p id='nameErr' class='text-danger'>First name/last name must start with capital letter and must contain only letters.</p>";
				name.css("border", "2px solid red");
				$(err).insertAfter(name);
			}
			brojGresaka++;
		}
		else {
			name.css("border", "2px solid gray");
			$('#nameErr').remove();
		}
		if (!mailReg.test(email.val())) {
			if (!$('#mailErr').length) {
				let err = "<p id='mailErr' class='text-danger'>E.q. johndoe@gmail.com</p>";
				email.css("border", "2px solid red");
				$(err).insertAfter(email);
			}
			brojGresaka++;
		}
		else {
			email.css("border", "2px solid gray");
			$('#mailErr').remove();
		}
		if (!cardReg.test(card.val())) {
			if (!$('#cardErr').length) {
				let err = "<p id='cardErr' class='text-danger'>Credit card number must contain 16 digits only starting with 5.</p>";
				card.css("border", "2px solid red");
				$(err).insertAfter(card);
			}
			brojGresaka++;
		}
		else {
			card.css("border", "2px solid gray");
			$('#cardErr').remove();
		}
		if (!cvvReg.test(cvv.val())) {
			if (!$('#cvvErr').length) {
				let err = "<p id='cvvErr' class='text-danger'>CVV is found on backside of your credit card.</p>";
				cvv.css("border", "2px solid red");
				$(err).insertAfter(cvv);
			}
			brojGresaka++;
		}
		else {
			cvv.css("border", "2px solid gray");
			$('#cvvErr').remove();
		}
		if (!dateReg.test(date.val())) {
			if (!$('#dateErr').length) {
				let err = "<p id='dateErr' class='text-danger'>Expiration date is found on front of you credit card.</p>";
				date.css("border", "2px solid red");
				$(err).insertAfter(date);
			}
			brojGresaka++;
		}
		else {
			date.css("border", "2px solid gray");
			$('#dateErr').remove();
		}
		if (!brojGresaka) {
			$("#infoUser").html(name.val().split(' ')[0] + ', you have successfully ordered ' + JSON.parse(localStorage.getItem('addedGame')).length + ' games. Check your email for more information.');
			$("#checkoutSuccess").modal('show');
			localStorage.removeItem('addedGame');
			setTimeout(function () {
				window.location.replace('https://adamnik101.github.io/gamehut/index.html');
			}, 5000);
		}
	}
	//region Ajax Call jQuery
	function getData(path, callback, storage) {
		try {
			return new Promise((resolve, reject) => {
				$.ajax({
					url: '/static/js/data/' + path + '.json', // Prepend /static/
					dataType: 'json',
					method: 'GET',
					success: (result) => {
						if (path == 'allGames') {
							resolve(allGames = result)
						}
						if (location.indexOf('single') != -1) {
							var owl_single = $(".single");
							owl_single.owlCarousel(
								{
									items: 1,
									loop: true,
									autoplay: true,
									mouseDrag: true,
									touchDrag: true,
									dots: true,
									nav: false,
									autoplayHoverPause: true
								}
							);
						}
						callback(result);
					},
					error: (xhr, status, err) => {
						reject(console.error(err));
						throw ('Greska pri dohvatanju podataka iz baze.');
					}
				})
			})
		}
		catch (e) {
			console.error(e.message);
		}
	}
	function getCategories(callback, divId, storage, path) {
		try {
			$.ajax({
				url: `/static/js/data/${path}.json`, // Use absolute path
				method: "GET",
				dataType: "json",
				success: (result) => {
					storage = result;
					callback(allGames, storage, divId);
				},
				error: (xhr, status, error) => {
					console.error(error);
				}
			});
		} catch (e) {
			console.error(e);
		}
	}

	//endregion

	//region Window: resize & Document: scroll
	$(window).on('resize', function () {
		setHeader();
		if (location.indexOf("index") != -1 || location == "/Web_2_sajt/") {
			removePng();
		}
		if (location.indexOf("shop") != -1) {
			filterResponsive();
		}
	});
	$(document).on('scroll', function () {
		setHeader();
	});
	//endregion
	$('#numberOfProducts').on("change", function () {
		let value = parseInt(this.value);
		changeNumber(value);
		// displayStoreFirst(allGames);
	})

	//region Functions

	//region Homepage slider
	function displayHomeSlider(data) {
		let content = '<div class="owl-carousel">';
		for (let game of data) {
			let gameToGet = game.name.toLowerCase();
			if (gameToGet.indexOf('minecraft') != - 1 || gameToGet.indexOf('redemption ii') != -1 || gameToGet.indexOf('heat') != -1) {
				content += `<div class="sliderTekst sliderImage">
						<div class="container fill_height">
						<div class="row align-items-center fill_height">
						<div class="col">
						<div class="main_slider_content">
						<h6>${getHeadline(game)}</h6>
						<h1>${game.name}</h1>
						<p>${getInfoText(game)}</p>
						</div>
						</div>
						</div>
						</div>
						</div>`
			}
		}
		content += '</div>'
		$('#slider').html(content);
		let backImg = $('.sliderImage');
		for (let i = 0; i < backImg.length; i++) {
			backImg[i].style.setProperty('--url', `url('/static/images/slider_${i + 1}.jpg')`);
		}

		owlDisplay();
	}
	function owlDisplay() {
		var owl = $('.owl-carousel');
		owl.owlCarousel(
			{
				items: 1,
				loop: true,
				mouseDrag: false,
				touchDrag: false,
				dots: false,
			}
		);
		function progress() {
			$("#progressBar").css("width", "0%");
			$("#progressBar").animate({
				width: "100%"
			}, 10000, "linear", () => {
				progress();
				owl.trigger('next.owl.carousel');
			});
		}
		progress();
	}
	function getHeadline(data) {
		if (data.newRelease.value) {
			return 'Available now!'
		}
		else if (data.price.discount.isDiscounted) {
			return 'On sale!'
		}
		else {
			return 'Check out!'
		}
	}
	function getInfoText(data) {
		let duzina = data.info.text.length;
		return data.info.text[0][1];
	}
	//endregion


	//region Header
	function setHeader() {

		if ($(window).scrollTop() > 100) {
			header.css({ 'top': "-50px" });
		}
		else {
			header.css({ 'top': "0" });
		}

		if (window.innerWidth > 991 && menuActive) {
			closeMenu();
		}
	};
	//endregion

	//region Menu
	function initMenu() {
		if (hamburger.length) {
			hamburger.on('click', function () {
				if (!menuActive) {
					openMenu();
				}
			});
		}

		if (fsOverlay.length) {
			fsOverlay.on('click', function () {
				if (menuActive) {
					closeMenu();
				}
			});
		}

		if (hamburgerClose.length) {
			hamburgerClose.on('click', function () {
				if (menuActive) {
					closeMenu();
				}
			});
		}

		if ($('.menu_item').length) {
			var items = document.getElementsByClassName('menu_item');
			var i;

			for (i = 0; i < items.length; i++) {
				if (items[i].classList.contains("has-children")) {
					items[i].onclick = () => {
						this.classList.toggle("active");
						var panel = this.children[1];
						if (panel.style.maxHeight) {
							panel.style.maxHeight = null;
						}
						else {
							panel.style.maxHeight = panel.scrollHeight + "px";
						}
					}
				}
			}
		}
	};
	function openMenu() {
		menu.addClass('active');
		menu.css("box-shadow", "rgb(0 0 0 / 50%) 0px 0px 0px 10000px");
		fsOverlay.css('pointer-events', "auto");
		menuActive = true;
	};
	function closeMenu() {
		menu.removeClass('active');
		menu.css("box-shadow", "none");
		fsOverlay.css('pointer-events', "none");
		menuActive = false;
	};
	//endregion

	//region Remove png on smaller resolution - homepage
	function removePng() {
		if (window.innerWidth < 992) {
			// $(".deal_ofthe_week_img img").hide();
			$(".deal_ofthe_week").height("auto")
		}
		else {
			$(".deal_ofthe_week_img img").show();
		}
	};
	function displayStoreFirst(data) {
		data = filterSearch(data);
		data = filterPrice(data);
		data = filterCat(data);
		data = filterMode(data);
		data = filterOther(data);
		data = sortAll(data);
		let allItems = [];
		let pageNumber = 0;
		let brojStranica = Math.ceil(data.length / maxItemsStore);
		for (let i = 0; i < brojStranica; i++) {
			allItems.push([]);
			pageNumber++;
			for (let x = 0; x < data.length; x++) {
				if (x == (maxItemsStore * pageNumber)) {
					break;
				}
				else if (x >= pageNumber * maxItemsStore - maxItemsStore) {
					allItems[i].push(data[x])
				}
			}
		};
		if (allItems.length) {
			displayPagination(allItems, brojStranica);
			displayGames(allItems[0], "products", "");
		}
		else {
			$("#pag").empty()
		}
		if (!data.length) {
			displayNoResults();
		}
	};
	function displayComingSoon(data) {
		let content = "<div class='owl-carousel' id='coming-owl'>";
		for (let game of data) {
			let date = getDateString(game.releaseDate);
			content += `<div class="soon_item_col">
							<div class="soon_item">
								<div class="soon_background" id="bg${game.id}"></div>
								<div class="soon_content d-flex flex-column align-items-center justify-content-center text-center">
									<img src="${game.image.logo.src}" class="img-fluid" alt="${game.image.logo.alt}">
									<h4 class="soon_title pt-3">Release Date: ${date.month} ${date.day}, ${date.year}</h4>
								</div>
							</div>
						</div>`;
		}
		content += "</div>"
		$(".coming-soon").html(content);
		for (let game of data) {
			$("#bg" + game.id).css("background-image", "url(" + game.image.background.src + ")");
		}
		let coming = $("#coming-owl");
		coming.owlCarousel((
			{
				autoplay: true,
				mouseDrag: true,
				touchDrag: true,
				loop: true,
				dots: false,
				nav: false,
				stagePadding: 50,
				margin: 20,
				autoplayHoverPause: true,
				responsive: {
					0: { items: 1 },
					768: { items: 2 },
					992: { items: 3 }
				}
			}
		))
	};
	//endregion

	//region Responsive filter section - store
	function filterResponsive() {
		if (window.innerWidth < 992) {
			if (!$('#close').length) {
				let close = `<div id="close" class="d-flex justify-content-center align-items-center p-3"><button type="button" id="closeFilter">Close filters</button> </div>`;
				$("#filter").prepend($(close));
			}
			$("#filter-small").html($("#filterBg"));
			$("#filter-wrapper").hide();
			$("#filter-wrapper").css({ "background-color": "#1d1d1d", 'box-shadow': "50px 0px 50px 1000px rgba(0,0,0,0.6)" });
			$("#filterBg").on("click", function () {
				$("#filter-wrapper").fadeIn();
			});
			$("#closeFilter").on("click", function () {
				$("#filter-wrapper").fadeOut();
			});
			$("#filter-wrapper").css({ position: "fixed", top: "0", left: "0", bottom: "0", "z-index": "999", "overflow-y": "scroll" });
			$("#filterBg").on("mouseover", function () {
				$(this).css("cursor", "pointer");
			})
		}
		else {
			$('#close').remove();
			$("#filterBg").css("width", "100%");
			$("#filter").prepend($("#filterBg"))
			$("#filter-wrapper").show();
			$("#filter-wrapper").css({ "background-color": "transparent", 'box-shadow': "none" })
			$("#filter-wrapper").css({ position: "relative", "z-index": 1, "overflow-y": "hidden" })
		}
	};
	//endregion

	//region Contact form - check
	function checkInputValues(input, errDiv, regEx, ifIsEmptyErrorMsg, ifDidntPassRegExMsg) {
		let val = false;
		let err;
		if (!input.value.length) {
			err = ifIsEmptyErrorMsg;
			$(input).css('border', '2px solid #e21e21');
			$('.' + errDiv).html(err);
		}
		else {
			if (!regEx.test(input.value)) {
				err = ifDidntPassRegExMsg;
				$(input).css('border', '2px solid #e21e21');
				$('.' + errDiv).html(err);
			}
			else {
				$(input).css('border', '2px solid green');
				$('.' + errDiv).html('');
				val = true;
			}
		}
		return val;
	} // for contact form
	//endregion

	//region Display modal
	function displayMessageModal(text) {
		var modal;
		if (!$('#modal').length) {
			modal = document.createElement('div'); // kreiram div u koji cu da smestam poruke
			modal.setAttribute('id', 'modal');
		}
		else {
			modal = document.getElementById('modal'); // ako postoji, onda ga dohvati
		}
		let message = document.createElement('div');
		message.setAttribute('id', 'message-modal');
		message.innerHTML = text;

		modal.appendChild(message);
		let footer = document.getElementsByTagName('footer');
		if ($("#modal").length) {
			modal.appendChild(message); // da ne dolazi do preklapanja poruka, vec da se ispisuju jedna ispod druge
		} else {
			$(modal).insertAfter(footer); // da ga postavim na kraju stranice
		}
		$(message).fadeIn();
		let promise = new Promise((resolve, reject) => {  //promise da bih obrisao element nakon izvrsvanja fade out-a, simuliram asinhroni zahtev pomocu timeout
			setTimeout(() => { $(message).fadeOut(); resolve() }, 3000);
		})
		promise.then(() => { // cekamo izvrsavanje promise-a
			setTimeout(() => {// nakon sto je gotov promise, izvrsava se i brise element nakon jedne sekunde
				$(message).remove();
			}, 1000)
		})
	}
	//endregion

	function checkCartAmount() {
		if (localStorage.getItem('addedGame')) {
			let addedGames = JSON.parse(localStorage.getItem('addedGame'));
			// $('#total-price').html(localStorage.getItem('total'));
			// $('#checkout_items').html(addedGames.length); // ispisujemo broj igrica unetih u korpu, distinct, ne povecavamo broj ako igrica vec postoji u korpi, vec u drugoj funkciji povecavamo quantity
		}

	}
	
	function displayNav(data) {
		let mainNav = '';
		let otherNav = '';
		for (let link of data) {
			otherNav += `<li><a href="/${link.link}">${link.name}</a></li>`
			if (link.id >= 4) {
				continue;
			}
			mainNav += `<li><a href="/${link.link}">${link.name}</a></li>`;
		}
		$(".navbar_menu").html(mainNav);
		$(".footer_nav").html(otherNav);
		$(".menu_top_nav").html(otherNav);
		$(".menu_top_nav").find("li").addClass('menu_item');
	}
	function changeNumber(value) {
		maxItemsStore = value;
	}
	function getDateString(game) {
		let month, day, year, date;
		date = game;
		let dateSplit = date.split("-");
		day = dateSplit[2];
		year = dateSplit[0];
		switch (dateSplit[1]) {
			case "01": month = "Jan"; break;
			case "02": month = "Feb"; break;
			case "03": month = "Mar"; break;
			case "04": month = "Apr"; break;
			case "05": month = "May"; break;
			case "06": month = "Jun"; break;
			case "07": month = "Jul"; break;
			case "08": month = "Aug"; break;
			case "09": month = "Sep"; break;
			case "10": month = "Oct"; break;
			case "11": month = "Nov"; break;
			case "12": month = "Dec"; break;
		}
		return {
			month: month,
			day: day,
			year: year
		}
	}


	$(document).on('click', '#price', sendToCart);
	$(document).on('click', '.favorite', sendToCart);
	// function sendToCart(){
	// 	var gameToAdd = [];
	// 	if(localStorage.getItem('addedGame')){
	// 		gameToAdd = JSON.parse(localStorage.getItem('addedGame'));
	// 	}
	// 	let gameId = $(this).data('id');
	// 	for(let game of allGames){
	// 		if(game.id == gameId){
	// 			if(gameToAdd.some(x => x.id == gameId)) {
	// 				gameToAdd.find(x => x.id == gameId).quantity++;
	// 				displayMessageModal(`You have ${gameToAdd.find(x => x.id == gameId).quantity} <span>${game.name}'s </span> in your cart.`)
	// 			}
	// 			else{
	// 				gameToAdd.push({
	// 					id : game.id,
	// 					image : game.image.logo,
	// 					name : game.name,
	// 					price : game.price.value.netPrice,
	// 					quantity : 1
	// 				})
	// 				displayMessageModal(`You added <span>${game.name} </span> into your cart.`)
	// 			}
	// 			localStorage.setItem('addedGame', JSON.stringify(gameToAdd));
	// 		}
	// 	}
	// 	checkCartAmount();
	// }
	//endregion

	//region Filtering functions - Price - Categories - Mode - Other
	$("#search").on('keyup', function () {
		filtered = filterSearch(allGames)
		// displayStoreFirst(filtered)
	})
	function filterSearch(data) {
		let search = document.getElementById('search');
		let text = search.value.trim().toLowerCase();
		if (search.value.length) {
			data = data.filter((game) => {
				if (game.name.toLowerCase().indexOf(text) != -1) {
					return game;
				}
			})
		}
		return data;
	}
	$("#priceFrom").on("input", getRangeValue("#from", "#priceFrom"));
	$("#priceTo").on("input", getRangeValue("#to", "#priceTo"));

	function filterPrice(data) {
		return data.filter(game => Math.floor(game.price.value.netPrice) < priceTo && Math.ceil(game.price.value.netPrice) > priceFrom);
	};
	function getRangeValue(output, value) {
		$('#priceTo').on('mouseup', function () {
			filtered = filterPrice(allGames);
			// displayStoreFirst(filtered);
		})
		$('#priceFrom').on('mouseup', function () {
			filtered = filterPrice(allGames);
			// displayStoreFirst(filtered);
		})
		return () => {
			$(output).val($(value).val());
			if (output == "#from") {
				priceFrom = $(value).val();
			} else {
				priceTo = $(value).val();
			}
		}
	};
	function removeUnchecked(array, value) {
		var index = array.indexOf(value);	// dohvatanje indeksa elementa koji je unchecked u nizu
		if (index != -1) {	// ako se nalazi u nizu
			array.splice(index, 1) // uklanjanje tog elementa
		}
	};

	function filterCat(data) {
		if (checkedCat.length) {
			filtered = data.filter(game => checkedCat.some(checked => game.catId.includes(checked)));
		}
		else {
			filtered = data;
		}
		return filtered;
	};
	function filterMode(data) {
		if (checkedMode.length) {
			filtered = data.filter(game => checkedMode.some(checked => game.modes.includes(checked)));
		}
		else {
			filtered = data;
		}
		return filtered;
	};
	function filterOther(data) {
		if (checkedOther.length) {
			filtered = data.filter(game => checkedOther.some(checked => game.otherId.includes(checked)));
		}
		else {
			filtered = data;
		}
		return filtered;
	};
	$(document).on('change', ':checkbox', function () {
		let name = this.getAttribute('name');
		if (name.indexOf('category') != -1) {
			checkboxFilter(this, checkedCat, filterCat);
		}
		else if (name.indexOf('modes') != -1) {
			checkboxFilter(this, checkedMode, filterMode);
		}
		else {
			checkboxFilter(this, checkedOther, filterOther);
		}
	})
	function checkboxFilter(checkbox, array, filterArray) {
		let value = parseInt($(checkbox).val());
		if ($(checkbox).is(":checked")) {
			array.push(value);
		}
		else {
			removeUnchecked(array, value);
		}
		filtered = filterArray(allGames);
		displayStoreFirst(filtered)
	}
	//endregion

	//region Open single page
	$(document).on("click", ".openSingle", function () {
		localStorage.setItem("id", ($(this).attr("data-id")));
		open("single.html", "_self");
	});
	//endregion

	//region Rotate Font Awesome icon
	$(document).on("click", "#filterCat", rotateHandler("#categoryChb", "#filterCat"));
	$(document).on("click", "#priceToggle", rotateHandler("#priceRange", "#priceToggle"));
	$(document).on("click", "#more-filters", rotateHandler("#mode", "#more-filters"));
	$(document).on("click", "#filter-other", rotateHandler("#otherFilter", "#filter-other"));

	function rotateHandler(button, div) {
		return () => {
			$(button).slideToggle();
			if (div == "#filterCat") {
				degreesCat += 180;
				$(div).find(".fas").css("transform", "rotate(" + degreesCat + "deg)");
			}
			else if (div == "#priceToggle") {
				degreesPrice += 180;
				$(div).find(".fas").css("transform", "rotate(" + degreesPrice + "deg)");
			}
			else if (div == "#more-filters") {
				degreesMore += 180;
				$(div).find(".fas").css("transform", "rotate(" + degreesMore + "deg)");
			}
			else {
				degreesOther += 180;
				$(div).find(".fas").css("transform", "rotate(" + degreesOther + "deg)");
			}

		}
	};
	//endregion

	//region Sorting - Store
	$(document).on("change", "#sort", function () {
		filtered = sortAll(allGames);
		displayStoreFirst(filtered)
	});
	function sortByNameAZ(data) {
		return data.sort((a, b) => {
			var nameA = a.name.toLowerCase();
			var nameB = b.name.toLowerCase();
			if (nameA < nameB) {
				return -1;
			}
			else if (nameA > nameB) {
				return 1;
			}
			return 0;
		})
	};
	function sortByNameZA(data) {
		return data.sort((a, b) => {
			var nameA = a.name.toLowerCase();
			var nameB = b.name.toLowerCase();
			if (nameA < nameB) {
				return 1;
			}
			else if (nameA > nameB) {
				return -1;
			}
			return 0;
		})
	}
	function sortByPriceHighLow(data) {
		return data.sort((a, b) => {
			var priceA;
			var priceB;
			priceA = Math.round(a.price.value.netPrice);
			priceB = Math.round(b.price.value.netPrice);

			if (priceA < priceB) {
				return 1;
			}
			else if (priceA > priceB) {
				return -1;
			}
			return 0;
		})
	}
	function sortByPriceLowHigh(data) {
		return data.sort((a, b) => {
			var priceA;
			var priceB;
			priceA = Math.round(a.price.value.netPrice);
			priceB = Math.round(b.price.value.netPrice);

			if (priceA < priceB) {
				return -1;
			}
			else if (priceA > priceB) {
				return 1;
			}
			return 0;
		})
	}
	function sortAll(data) {
		let value = $("#sort").val();
		if (value == 'nameASC') {
			return sortByNameAZ(data);
		}
		else if (value == 'nameDESC') {
			return sortByNameZA(data);
		}
		else if (value == 'priceDESC') {
			return sortByPriceHighLow(data);
		}
		else if (value == 'priceASC') {
			return sortByPriceLowHigh(data);
		}
		else {
			return data;
		}
	}
	//endregion

	//region Pagination - Store
	function displayPagination(allPages, numberOfPages) {
		if (allPages.length) {
			let display = `<ul class="d-flex flex-row" id="pagination">`;
			for (let i = 0; i < numberOfPages; i++) {
				display += `<li class="pagination-item mr-2`;
				if (i == 0) {
					display += " active-pag";
				}
				display += `" id="pag-${i + 1}">${i + 1}</li>`
			}
			display += "</ul>";
			$("#pag").html(display);
		}

		$(".pagination-item").on("click", function () {
			let pag = document.getElementsByClassName('pagination-item');
			for (let i = 0; i < pag.length; i++) {
				if (this.id == pag[i].id) {
					displayGames(allPages[i], 'products');
					$(".pagination-item").removeClass("active-pag")
					$(this).addClass("active-pag")
				}
			}
		})

	};
	//endregion

	//region Display no results - Store
	function displayNoResults() {
		$("#products").removeClass("row-cols-1 row-cols-sm-2 row-cols-md-3");
		$("#products").addClass("d-flex align-items-center justify-content-center h-100");
		var msg = `<div id="noMatch" class="pb-5 pb-md-0">
							<i class="far fa-frown pb-3"></i>
							<p>No results found</p>	
							<span>Unfortunately I could not find any results matching your search.</span>	   
						</div>`;
		$("#products").html(msg);
	}
	//endregion

	//region Global RegEx

	const mailReg = /^[a-z][a-z.\d-_]+@[a-z]+(\.[a-z]+)+$/;// potreban za newsletter na svakoj strani i contact stranicu
	const fullNameReg = /^[A-ZŠĐČĆŽ][a-zšđčćž]{2,14}(\s[A-ZČĆŽŠĐ][a-zšđčćž]{2,19})+$/; // za kontakt formu i order formu

	//endregion

	//region Newslettter
	const newsletterForm = document.getElementById('newsletter_form');
	const newsletter = document.getElementById('newsletter_email');
	var correctNewsletter = false;
	newsletter.onchange = () => {
		checkInputValues(newsletter, 'newsletterErr', mailReg, 'Newsletter email cannot be empty', 'Mail is not in a good format. (E.q: johndoe5@gmail.com)');
	};
	newsletterForm.onsubmit = (e) => {
		e.preventDefault();
		correctNewsletter = checkInputValues(newsletter, 'newsletterErr', mailReg, 'Newsletter email cannot be empty', 'Mail is not in a good format. (E.q: johndoe5@gmail.com)');
		if (correctNewsletter) {
			setNewsletterCookie('newsletter', newsletter.value, 6);
		}
	};
	function checkCookieNewsletter() {
		let cookie = document.cookie.split("; "); //dohvatamo kolacice vezane za newsletter mejlove
		let values = [];
		for (let newsletter of cookie) {
			if (newsletter.includes('newsletter')) {
				values.push(newsletter.split('=')[1]);
			}
		}
		if (cookie) { //ako postoje
			for (let x of values) {
				if (!news.includes(x)) {
					news.push(x); // ubacujemo vrednosti kolacica koje vec ne postoje u nizu
				}
			}
		}
	}


	//endregion

	//region Set newsletter cookie function
	function setNewsletterCookie(name, value, duration) {
		checkCookieNewsletter();
		let date = new Date();
		date.setMonth(date.getMonth() + duration);
		let cookie = document.cookie.split("; ").find(val => val.startsWith(name + '='));
		if (cookie) {
			if (news.length) {
				if (news.includes(value)) {
					displayMessageModal('Oops. Looks like you are already subscribed to our newsletter.');
				}
				else {
					if (value.length) {
						if (!news.includes(value)) {
							news.push(value);
						}
					}
					displayMessageModal('You have successfully subscribed to our newsletter.');
					for (let i = news.length - 1; i < news.length; i++) {
						document.cookie = `${name}${i}=${news[i]}; expires=${date.toUTCString()}; secure`;
					}

				}
			}
		}
		else {
			document.cookie = `${name}=${value}; expires=${date.toUTCString()}; secure`;
			displayMessageModal('You have successfully subscribed to our newsletter.');
		}
	}
	//endregion

	//region cookie accept
	let cookieAccept = document.getElementById('cookie-accept');
	cookieAccept.onclick = () => {
		localStorage.setItem('cookies', 'accepted');
		$('#cookie-wrapper').fadeOut();
	}
	if (localStorage.getItem('cookies')) {
		$('#cookie-wrapper').remove();
	}
	else {
		$('#cookie-wrapper').css('display', 'block');
	}
	//endregion

});
