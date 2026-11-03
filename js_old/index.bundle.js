/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/modules/geography-presence-slider.js":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   geographyPresenceSlider: function() { return /* binding */ geographyPresenceSlider; },
/* harmony export */   updateGeographySwiper: function() { return /* binding */ updateGeographySwiper; }
/* harmony export */ });
// ============= GEOGRAPHY PRESENCE SLIDER MODULE =============
let swiper = null;

function geographyPresenceSlider() {
	const checkCarousel = document.querySelector('.geography-presence__carousel.swiper');

	function initSwiper() {
		if (!checkCarousel) return;
		if (window.innerWidth < 1365) {
			if (!swiper) {
				swiper = new Swiper(checkCarousel, {
					slidesPerView: 1,
					spaceBetween: 20,
					observer: true,
					observeParents: true,
					observeSlideChildren: true,
					pagination: {
						el: '.geography-presence__pagination.swiper-pagination',
						type: 'bullets',
						clickable: true,
					},
				});
			} else {
				swiper.update();
			}
		} else {
			if (swiper) {
				swiper.destroy(true, true);
				swiper = null;
			}
		}
	}

	window.addEventListener('resize', initSwiper);
	initSwiper();
}

function updateGeographySwiper() {
	if (swiper) swiper.update();
}


/***/ }),

/***/ "./src/js/modules/geography-presence.js":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Aw: function() { return /* binding */ geographyPresence; },
/* harmony export */   Lq: function() { return /* binding */ updateVisiblePlacemarksAndCards; },
/* harmony export */   VF: function() { return /* binding */ resetMapPlacemarks; }
/* harmony export */ });
/* unused harmony export GeographyPresence */
/* harmony import */ var _geography_presence_slider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/js/modules/geography-presence-slider.js");


class StylesManager {
	static inject() {
		if (document.getElementById('geography-styles')) return;
		const style = document.createElement('style');
		style.id = 'geography-styles';
		style.textContent = `
      .geography-presence__skeleton {
        position: relative;
        background-color: #f0f0f0;
        width: 100%;
        height: 100%;
        overflow: hidden;
				border-radius: 16px;
      }
      .geography-presence__skeleton::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
				z-index: -1;	
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .geography-presence__article-skeleton {
        height: 140px;
        background: #f4f5fa;
        border-radius: 16px;
        position: relative;
        overflow: hidden;
        margin-bottom: 18px;
      }
      .geography-presence__article-skeleton::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.3s infinite;
      }
      .geography-presence__result-skeleton {
        display: inline-block;
        vertical-align: middle;
        width: 150px;
        height: 1em;
        margin-left: 0.5em;
        background-color: #f0f0f0;
        position: relative;
        overflow: hidden;
        border-radius: 4px;
      }
      .geography-presence__result-skeleton::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      .geography-presence__article {
        opacity: 0;
        transform: translateY(40px);
        pointer-events: none;
        transition: opacity 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1);
        display: flex;
      }
      .geography-presence__article.is-visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
    `;
		document.head.appendChild(style);
	}
}

class SkeletonManager {
	static showMapSkeleton(mapContainer, isMapInitialized) {
		if (isMapInitialized || !mapContainer) return null;
		const existing = mapContainer.querySelector('.geography-presence__skeleton');
		if (existing) return existing;
		const sk = document.createElement('div');
		sk.className = 'geography-presence__skeleton';
		mapContainer.appendChild(sk);
		return sk;
	}
	static showArticlesSkeleton() {
		const container = document.querySelector('.geography-presence__carousel-wrapper');
		if (!container) return;
		const count = document.querySelectorAll('.geography-presence__article').length || 6;
		document.querySelectorAll('.geography-presence__article').forEach(el => el.style.display = 'none');
		for (let i = 0; i < count; i++) {
			const sk = document.createElement('div');
			sk.className = 'geography-presence__article-skeleton';
			container.appendChild(sk);
		}
	}
	static hideArticlesSkeleton() {
		document.querySelectorAll('.geography-presence__article-skeleton').forEach(el => el.remove());
		document.querySelectorAll('.geography-presence__article').forEach(el => el.style.display = '');
	}
	static showResultSkeleton() {
		const resultWrapper = document.querySelector('.geography-presence__result');
		const span = resultWrapper?.querySelector('span');
		if (!span) return;
		const sk = document.createElement('div');
		sk.className = 'geography-presence__result-skeleton';
		span.replaceWith(sk);
	}
	static hideResultSkeleton(count) {
		const resultWrapper = document.querySelector('.geography-presence__result');
		const sk = resultWrapper?.querySelector('.geography-presence__result-skeleton');
		if (!sk) return;
		const span = document.createElement('span');
		const endings = UIManager._getPluralEnding(count);
		span.textContent = `Найдено ${count} фитнес-объект${endings}`;
		sk.replaceWith(span);
	}
}

class YandexMapsLoader {
	static #loadPromise = null;
	static #API_KEY = '3dc07a98-540b-4338-b92a-1e358928cde6';
	static async load() {
		if (this.#loadPromise) return this.#loadPromise;
		this.#loadPromise = new Promise((resolve, reject) => {
			if (typeof ymaps !== 'undefined') {
				ymaps.ready(() => resolve(ymaps));
				return;
			}
			const script = document.createElement('script');
			script.src = `https://api-maps.yandex.ru/2.1/?apikey=${this.#API_KEY}&lang=ru_RU`;
			script.async = true;
			script.onload = () => ymaps.ready(() => resolve(ymaps));
			script.onerror = () => reject(new Error('Не удалось загрузить Yandex Maps API'));
			document.head.appendChild(script);
		});
		return this.#loadPromise;
	}
}

class FilterManager {
	static getState() {
		const desktopCity = document.querySelector('input[name="country"]:checked')?.value || null;
		const desktopLocation = document.querySelector('input[name="location"]:checked')?.value || null;
		const desktopLocationArea = document.querySelector('input[name="location-area"]:checked')?.value || null;
		const desktopSports = Array.from(document.querySelectorAll('input[name="sport"]:checked')).map(i => i.value);
		const desktopCards = Array.from(document.querySelectorAll('input[name="Серебро"]:checked, input[name="Золото"]:checked, input[name="Премиум"]:checked')).map(i => i.value);
		const desktopMore = Array.from(document.querySelectorAll([
			'input[name="Круглосуточный"]:checked',
			'input[name="Только для женщин"]:checked',
			'input[name="Только для мужчин"]:checked',
			'input[name="Детские занятия"]:checked',
			'input[name="Занятия для беременных"]:checked',
			'input[name="Есть парковка"]:checked',
			'input[name="Требуется бронирование"]:checked',
			'input[name="Условия для людей с ограничениями"]:checked',
			'input[name="Душ"]:checked',
			'input[name="Для грудничков"]:checked',
			'input[name="Есть сауна"]:checked'
		].join(', '))).map(i => i.value);
		const mobileCity = document.querySelector('input[name="form-city-filter"]:checked')?.value || null;
		const mobileLocations = Array.from(document.querySelectorAll('input[name="form-location-filter"]:checked')).map(i => i.value);
		const mobileSports = Array.from(document.querySelectorAll('input[name="form-sport-filter"]:checked')).map(i => i.value);
		const mobileCards = Array.from(document.querySelectorAll('input[name="form-card-filter"]:checked')).map(i => i.value);
		const mobileMore = Array.from(document.querySelectorAll('input[name="form-additional-filter"]:checked')).map(i => i.value);
		return {
			city: mobileCity || desktopCity,
			location: desktopLocation,
			locationArea: desktopLocationArea,
			mobileLocations,
			sportInputs: mobileSports.length > 0 ? mobileSports : desktopSports,
			cardInputs: mobileCards.length > 0 ? mobileCards : desktopCards,
			moreInputs: mobileMore.length > 0 ? mobileMore : desktopMore
		};
	}
	static applyFilters(items, { city, location, locationArea, mobileLocations, sportInputs, cardInputs, moreInputs }) {
		return items.filter(item => {
			if (mobileLocations.length === 0 && city && item.city !== city) return false;
			if (mobileLocations.length === 0 && location && !item.locations.includes(location)) return false;
			if (mobileLocations.length === 0 && locationArea && !item.locations.includes(locationArea)) return false;
			if (mobileLocations.length > 0) {
				const ok = mobileLocations.some(loc => item.locations.includes(loc));
				if (!ok) return false;
			}
			if (sportInputs.length > 0) {
				const ok = sportInputs.some(s => item.sportTypes.includes(s));
				if (!ok) return false;
			}
			if (cardInputs.length > 0) {
				const ok = cardInputs.some(c => item.cardTypes.includes(c));
				if (!ok) return false;
			}
			if (moreInputs.length > 0) {
				const ok = moreInputs.some(m => item.moreTypes.includes(m));
				if (!ok) return false;
			}
			return true;
		});
	}
}

class ArticleParser {
	static parseAll() {
		return Array.from(document.querySelectorAll('.geography-presence__article'))
			.map((el, idx) => this.parseArticle(el, idx));
	}
	static parseArticle(el, idx) {
		const d = el.dataset;
		return {
			element: el,
			index: idx,
			lat: parseFloat(d.lat),
			lng: parseFloat(d.lng),
			city: d.city || '',
			locations: this.#parseArray(d.location),
			sportTypes: this.#parseArray(d.typeSport, /[;,]/),
			cardTypes: this.#parseArray(d.typeCard, /[;,]/),
			moreTypes: this.#parseArray(d.typeMore, /[;,]/),
			title: el.querySelector('.geography-presence__strong')?.textContent || '',
			address: this.#getCardAddress(el),
			icon: d.imageSrc || null
		};
	}
	static #parseArray(str, delim = /[;,]/) {
		if (!str) return [];
		return str.split(delim).map(s => s.trim()).filter(Boolean);
	}
	static #getCardAddress(el) {
		const pin = el.querySelector('.geography-presence__item .icon__pin')?.closest('.geography-presence__item');
		return pin?.querySelector('.geography-presence__span')?.textContent || '';
	}
}

class PlacemarkFactory {
	static createPlacemark(item) {
		const icon = item.icon;
		const placemark = new ymaps.Placemark(
			[item.lat, item.lng],
			{
				hintContent: item.title,
				balloonContent: PlacemarkFactory._getBalloonContent(item.index)
			},
			icon ? {
				iconLayout: 'default#image',
				iconImageHref: icon,
				iconImageSize: [40, 40],
				iconImageOffset: [-20, -40]
			} : {}
		);

		placemark.properties.set('index', item.index);

		placemark.events.add('balloonopen', function () {
			const content = PlacemarkFactory._getBalloonContent(item.index);
			placemark.properties.set('balloonContent', content);
		});

		return placemark;
	}

	// ↓↓↓ ВСТАВИТЬ ВНИЗУ КЛАССА ↓↓↓

	static _getBalloonContent(index) {
		const articleEl = document.querySelectorAll('.geography-presence__article')[index];
		if (!articleEl) return '';
		const title = articleEl.querySelector('.geography-presence__strong')?.textContent?.trim() || '';
		const address = articleEl.querySelector('.geography-presence__span-address')?.textContent?.trim() || '';
		return `<div><b>${title}</b><br>${address}</div>`;
	}
}


class UIManager {
	static updateResultCounter(count) {
		const resultEl = document.querySelector('.geography-presence__result span');
		if (!resultEl) return;
		if (count === 0) {
			resultEl.textContent = 'Ничего не найдено. Измените результаты поиска и повторите попытку.';
		} else {
			const endings = this._getPluralEnding(count);
			resultEl.textContent = `Найдено ${count} фитнес-объект${endings}`;
		}
	}
	static _getPluralEnding(count) {
		if (count % 10 === 1 && count % 100 !== 11) return '';
		if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'а';
		return 'ов';
	}
	static updateLocationDropdowns(city) {
		document.querySelectorAll('.select-filter__dropdown[data-action]').forEach(ul => ul.style.display = 'none');
		document.querySelectorAll('.filter-aside__content-list[data-action]').forEach(ul => ul.style.display = 'none');
		const cfgMap = {
			'Москва': { dShow: 'msk-metro', dHide: 'msk-area', mShow: 'msk-mobile-metro', mHide: 'msk-mobile-area' },
			'Санкт-Петербург': { dShow: 'spb-metro', dHide: 'spb-area', mShow: 'spb-mobile-metro', mHide: 'spb-mobile-area' },
			'Московская обл': { dShow: 'msk-area', mShow: 'msk-mobile-area' },
			'Ленинградская обл': { dShow: 'spb-area', mShow: 'spb-mobile-area' }
		};
		const cfg = cfgMap[city];
		if (!cfg) return;
		const ds = document.querySelector(`.select-filter__dropdown[data-action="${cfg.dShow}"]`); if (ds) ds.style.display = '';
		if (cfg.dHide) { const dh = document.querySelector(`.select-filter__dropdown[data-action="${cfg.dHide}"]`); if (dh) dh.style.display = 'none'; }
		const ms = document.querySelector(`.filter-aside__content-list[data-action="${cfg.mShow}"]`); if (ms) ms.style.display = '';
		if (cfg.mHide) { const mh = document.querySelector(`.filter-aside__content-list[data-action="${cfg.mHide}"]`); if (mh) mh.style.display = 'none'; }
	}
	static animateArticles(filtered, all) {
		let hideCount = 0;
		let needUpdate = false;
		all.forEach(item => {
			if (filtered.includes(item)) {
				item.element.style.display = '';
				item.element.classList.remove('is-visible');
				void item.element.offsetWidth;
				item.element.classList.add('is-visible');
			} else {
				item.element.classList.remove('is-visible');
				hideCount++;
				setTimeout(() => {
					item.element.style.display = 'none';
					hideCount--;
					if (hideCount === 0) (0,_geography_presence_slider__WEBPACK_IMPORTED_MODULE_0__.updateGeographySwiper)();
				}, 250);
				needUpdate = true;
			}
		});
		if (!needUpdate) (0,_geography_presence_slider__WEBPACK_IMPORTED_MODULE_0__.updateGeographySwiper)();
	}
}

// ============= MOBILE FILTER MANAGER =============
class MobileFilterManager {
	static init() {
		this.#setupEventListeners();
	}
	static #setupEventListeners() {
		document.querySelectorAll('.filter-aside__bottom-btn[data-action="apply-inside-filter"]').forEach(btn => btn.addEventListener('click', () => this.#handleInsideFilterApply(btn)));
		const searchBtn = document.querySelector('.filter-aside__search[data-action="search-filter"]');
		if (searchBtn) searchBtn.addEventListener('click', () => this.#handleMainSearchApply());
		const clearBtn = document.querySelector('.filter-aside__clear[data-action="clear-filter"]');
		if (clearBtn) clearBtn.addEventListener('click', () => this.#handleClearFilters());
		document.querySelectorAll('input[name="form-city-filter"]').forEach(radio => {
			radio.addEventListener('change', () => {
				UIManager.updateLocationDropdowns(radio.value);
				this.#updateApplyButtonState();
			});
		});
		document.querySelectorAll('input[name="form-location-filter"], input[name="form-sport-filter"], input[name="form-card-filter"], input[name="form-additional-filter"]').forEach(cb => cb.addEventListener('change', () => this.#updateApplyButtonState()));
		document.querySelectorAll('.filter-aside__close').forEach(btn => {
			btn.addEventListener('click', () => this.#closeMobileFilter());
		});
	}
	static #handleInsideFilterApply(btn) {
		if (btn.disabled) return;
		const modal = btn.closest('.filter-aside__menu');
		if (modal) {
			modal.classList.add('filter-hide');
			modal.setAttribute('aria-expanded', 'false');
			setTimeout(() => modal.classList.remove('filter-hide'), 400);
		}
		this.#updateFilterButtonCounts();
		this.#updateMainSearchButtonState();
	}
	static #handleMainSearchApply() {
		const searchBtn = document.querySelector('.filter-aside__search[data-action="search-filter"]');
		if (searchBtn && searchBtn.disabled) return;
		this.#closeMobileFilter();
		SkeletonManager.showArticlesSkeleton();
		SkeletonManager.showResultSkeleton();
		setTimeout(() => {
			SkeletonManager.hideArticlesSkeleton();
			const instance = window.geographyPresenceInstance;
			instance.articles = ArticleParser.parseAll();
			instance.allPlacemarks = instance.articles.map(item => PlacemarkFactory.createPlacemark(item));
			instance.updateVisibleContent();
			// Корректно показываем итоговое число только реально видимых
			const visibleCount = instance.getVisibleArticlesCount();
			SkeletonManager.hideResultSkeleton(visibleCount);
		}, 350);
	}
	static #handleClearFilters() {
		document.querySelectorAll(
			'input[name="form-location-filter"], input[name="form-sport-filter"], input[name="form-card-filter"], input[name="form-additional-filter"]'
		).forEach(i => i.checked = false);
		const moscow = document.querySelector('input[name="form-city-filter"][value="Москва"]');
		if (moscow) { moscow.checked = true; UIManager.updateLocationDropdowns('Москва'); }
		document.querySelectorAll('.filter-aside__add').forEach(span => span.remove());
		this.#updateApplyButtonState();
		this.#updateMainSearchButtonState();
		const clearBtn = document.querySelector('.filter-aside__clear[data-action="clear-filter"]');
		if (clearBtn) clearBtn.setAttribute('aria-expanded', 'false');
		// Показываем все карточки и пины (reset)
		const instance = window.geographyPresenceInstance;
		if (instance) {
			instance.articles = ArticleParser.parseAll();
			instance.allPlacemarks = instance.articles.map(i => PlacemarkFactory.createPlacemark(i));
			instance.updateVisibleContent();
		}
	}
	static #updateApplyButtonState() {
		document.querySelectorAll('.filter-aside__bottom-btn[data-action="apply-inside-filter"]').forEach(btn => {
			const modal = btn.closest('.filter-aside__menu');
			btn.disabled = !modal.querySelectorAll('input:checked').length;
		});
		this.#updateMainSearchButtonState();
	}
	static #updateMainSearchButtonState() {
		const searchBtn = document.querySelector('.filter-aside__search[data-action="search-filter"]');
		if (!searchBtn) return;
		const hasAny = document.querySelectorAll(
			'input[name="form-city-filter"]:checked, input[name="form-location-filter"]:checked, input[name="form-sport-filter"]:checked, input[name="form-card-filter"]:checked, input[name="form-additional-filter"]:checked'
		).length > 0;
		searchBtn.disabled = !hasAny;
		const clearBtn = document.querySelector('.filter-aside__clear[data-action="clear-filter"]');
		if (clearBtn) {
			const nonCity = document.querySelectorAll(
				'input[name="form-location-filter"]:checked, input[name="form-sport-filter"]:checked, input[name="form-card-filter"]:checked, input[name="form-additional-filter"]:checked'
			).length > 0;
			clearBtn.setAttribute('aria-expanded', nonCity);
		}
	}
	static #updateFilterButtonCounts() {
		document.querySelectorAll('.filter-aside__btn[data-id]').forEach(btn => {
			const menu = document.getElementById(btn.dataset.id);
			if (!menu) return;
			const count = menu.querySelectorAll('input:checked').length;
			const spanBox = btn.closest('.filter-aside__item')?.querySelector('.filter-aside__span');
			if (!spanBox) return;
			let cs = spanBox.querySelector('.filter-aside__add');
			if (count > 0) {
				if (!cs) { cs = document.createElement('span'); cs.classList.add('filter-aside__add'); spanBox.appendChild(cs); }
				cs.textContent = count;
			} else {
				cs?.remove();
			}
		});
	}
	static #closeMobileFilter() {
		const aside = document.querySelector('.filter-aside');
		if (aside) {
			aside.classList.add('filter-hide');
			aside.classList.remove('filter-show');
			aside.setAttribute('aria-expanded', 'false');
			setTimeout(() => {
				aside.classList.remove('filter-hide');
				document.querySelector('.filter-backdrop')?.remove();
			}, 400);
		}
		document.body.style.overflow = '';
	}
}

class DesktopFilterManager {
	static init(instance) {
		const clearBtn = document.querySelector('.select-filter__clear[data-action="clear-filter"]');
		if (clearBtn) {
			clearBtn.addEventListener('click', () => {
				// Сброс радиокнопки городов (Москва)
				const moscow = document.querySelector('input[name="country"][value="Москва"]');
				if (moscow) moscow.checked = true;
				// Сброс всех чекбоксов фильтров
				document.querySelectorAll('input[name="location"]:checked, input[name="location-area"]:checked, input[name="sport"]:checked, input[name="Серебро"]:checked, input[name="Золото"]:checked, input[name="Премиум"]:checked').forEach(i => i.checked = false);
				[
					"Круглосуточный", "Только для женщин", "Только для мужчин", "Детские занятия",
					"Занятия для беременных", "Есть парковка", "Требуется бронирование",
					"Условия для людей с ограничениями", "Душ", "Для грудничков", "Есть сауна"
				].forEach(name => {
					document.querySelectorAll(`input[name="${name}"]:checked`).forEach(i => i.checked = false);
				});
				// Обновить дропдауны
				UIManager.updateLocationDropdowns('Москва');
				// Перепарсить статьи и пины
				instance.articles = ArticleParser.parseAll();
				instance.allPlacemarks = instance.articles.map(i => PlacemarkFactory.createPlacemark(i));

				// Устанавливаем флаг сброса
				instance._resetToDefaultMoscow = true;
				instance.updateVisibleContent();
				instance._resetToDefaultMoscow = false; // сбросим сразу после
			});
		}
	}
}


// ============= MAIN GEOGRAPHY PRESENCE CLASS =============
class GeographyPresence {
	constructor() {
		this.map = null;
		this.allPlacemarks = [];
		this.mapInitialized = false;
		this.articles = [];
		this._defaultCenter = [55.751574, 37.573856];
		this._defaultZoom = 5;
		this._forceShowAll = false; // флаг для десктопного сброса
		this._initialBounds = null;
	}
	async init() {
		const mapContainer = document.getElementById('map');
		if (!mapContainer) {
			console.error('Map container not found');
			return;
		}
		try {
			StylesManager.inject();
			await this.#showLoadingState();
			await this.#initializeMap(mapContainer);
			await this.#setupInitialState();
			this.#setupEventListeners();
			await this.#finalizeInitialization();
		} catch (e) {
			console.error('Failed to init:', e);
			this.#handleInitializationError();
		}
		MobileFilterManager.init();
		DesktopFilterManager.init(this);
		window.geographyPresenceInstance = this;
	}
	async #showLoadingState() {
		const mapContainer = document.getElementById('map');
		this.mapSkeleton = SkeletonManager.showMapSkeleton(mapContainer, this.mapInitialized);
		SkeletonManager.showArticlesSkeleton();
		SkeletonManager.showResultSkeleton();
	}
	async #initializeMap(mapContainer) {
		await YandexMapsLoader.load();
		this.map = new ymaps.Map(mapContainer, {
			center: [55.751574, 37.573856],
			zoom: 5,
			controls: ['zoomControl', 'fullscreenControl']
		});
		this.mapInitialized = true;
		if (this.mapSkeleton) {
			this.mapSkeleton.remove();
			this.mapSkeleton = null;
		}
	}
	async #setupInitialState() {
		const moscow = document.querySelector('input[name="country"][value="Москва"]');
		if (moscow && !moscow.checked) moscow.checked = true;
		const sel = document.querySelector('input[name="country"]:checked');
		UIManager.updateLocationDropdowns(sel?.value || 'Москва');
		this.articles = ArticleParser.parseAll();
		this.allPlacemarks = this.articles.map(i => PlacemarkFactory.createPlacemark(i));
	}
	#setupEventListeners() {
		document.querySelectorAll('.select-filter__apply').forEach(btn => btn.addEventListener('click', () => this.#handleFilterApply(btn)));
		document.querySelectorAll('input[name="country"]').forEach(radio => radio.addEventListener('change', () => {
			UIManager.updateLocationDropdowns(radio.value);
			this.articles = ArticleParser.parseAll();
			this.allPlacemarks = this.articles.map(i => PlacemarkFactory.createPlacemark(i));
			// this.updateVisibleContent(); // оставлено на onApply
		}));
	}
	async #finalizeInitialization() {
		setTimeout(() => {
			SkeletonManager.hideArticlesSkeleton();
			SkeletonManager.hideResultSkeleton(this.articles.length);
			this.updateVisibleContent();
		}, 450);
	}
	#handleInitializationError() {
		if (this.mapSkeleton) {
			this.mapSkeleton.remove();
			this.mapSkeleton = null;
		}
		SkeletonManager.hideArticlesSkeleton();
		SkeletonManager.hideResultSkeleton(0);
	}
	#handleFilterApply(btn) {
		if (btn.disabled) return;
		SkeletonManager.showArticlesSkeleton();
		SkeletonManager.showResultSkeleton();
		setTimeout(() => {
			SkeletonManager.hideArticlesSkeleton();
			this.articles = ArticleParser.parseAll();
			this.allPlacemarks = this.articles.map(i => PlacemarkFactory.createPlacemark(i));
			this.updateVisibleContent();
			// Показываем реально видимые
			const visibleCount = this.getVisibleArticlesCount();
			SkeletonManager.hideResultSkeleton(visibleCount);
		}, 350);
	}
	// Новый метод для подсчета реально видимых статей
	getVisibleArticlesCount() {
		return document.querySelectorAll('.geography-presence__article.is-visible:not([style*="display: none"])').length;
	}

	updateVisibleContent() {
		const state = FilterManager.getState();
		const filtered = FilterManager.applyFilters(this.articles, state);
		filtered.forEach(item => {
			const addrEl = item.element.querySelector('.geography-presence__span-address');
			if (addrEl && item.address) {
				addrEl.textContent = item.address;
			}
		});
		// Сброс фильтров на десктопе: показать только Москву, карта — в дефолте
		if (this._resetToDefaultMoscow) {
			const moscowItems = this.articles.filter(i => i.city === 'Москва');
			document.querySelectorAll('.geography-presence__article.swiper-slide').forEach(card => {
				card.style.display = '';
			});
			UIManager.updateResultCounter(moscowItems.length);
			UIManager.animateArticles(moscowItems, this.articles);
			this.#updateMapPlacemarks(moscowItems);
			this.map.setCenter([55.751574, 37.573856], 5);
			(0,_geography_presence_slider__WEBPACK_IMPORTED_MODULE_0__.updateGeographySwiper)?.();
			return;
		}


		if (filtered.length === 0) {
			document.querySelectorAll('.geography-presence__article.swiper-slide').forEach(card => {
				card.style.display = 'none';
				card.classList.remove('is-visible');
			});
			UIManager.updateResultCounter(0);
			this.map.geoObjects.removeAll();
			// Центрируем карту как по дефолту, если ничего не найдено
			this.map.setCenter([55.751574, 37.573856], 5);
			return;
		}

		document.querySelectorAll('.geography-presence__article.swiper-slide').forEach(card => {
			card.style.display = '';
		});
		UIManager.animateArticles(filtered, this.articles);
		this.#updateMapPlacemarks(filtered);
		UIManager.updateResultCounter(filtered.length);
		(0,_geography_presence_slider__WEBPACK_IMPORTED_MODULE_0__.updateGeographySwiper)?.();
	}

	#updateMapPlacemarks(filtered) {
		this.map.geoObjects.removeAll();
		filtered.forEach(item => {
			const pm = this.allPlacemarks[item.index];
			if (pm) this.map.geoObjects.add(pm);
		});
		this.#adjustMapView(filtered);
	}
	#adjustMapView(filtered) {
		if (!filtered.length) return;
		const coords = filtered.map(i => [i.lat, i.lng]);
		if (coords.length === 1) {
			this.map.setCenter(coords[0], 13);
		} else {
			this.map.setBounds(
				ymaps.util.bounds.fromPoints(coords),
				{ checkZoomRange: true, zoomMargin: 20 }
			);
		}
	}
	resetPlacemarks() {
		this.updateVisibleContent();
	}
}

// ============= ЭКСПОРТЫ =============
let geographyPresenceInstance = null;
async function geographyPresence() {
	if (!geographyPresenceInstance) {
		geographyPresenceInstance = new GeographyPresence();
	}
	await geographyPresenceInstance.init();
}
function updateVisiblePlacemarksAndCards() {
	geographyPresenceInstance?.updateVisibleContent();
}
function resetMapPlacemarks() {
	geographyPresenceInstance?.resetPlacemarks();
}


/***/ }),

/***/ "./src/js/modules/init-partner-carousel.js":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initPartnerCarousel: function() { return /* binding */ initPartnerCarousel; },
/* harmony export */   startPartnerCarousel: function() { return /* binding */ startPartnerCarousel; },
/* harmony export */   stopPartnerCarousel: function() { return /* binding */ stopPartnerCarousel; }
/* harmony export */ });
let startPartnerCarousel = () => { };
let stopPartnerCarousel = () => { };

function initPartnerCarousel() {
	const wrapper = document.querySelector('.partner-block');
	const container = document.querySelector('.partner-block__right-carousel');
	if (!container) return;

	const section = container.closest('.page-partners');
	const autoStart = section?.dataset.action === 'visible-block';

	const slides = Array.from(container.querySelectorAll('.partner-block__right-carousel-slide'));
	const leftSliderEl = document.querySelector('.partner-block__left-carousel.swiper');
	if (!leftSliderEl) return;

	let currentIndex = 0;
	let timer = null;
	let paused = false;
	let startTime = 0;
	const interval = 5000;

	const leftSlider = new Swiper(leftSliderEl, {
		loop: false,
		speed: 600,
		allowTouchMove: false,
		slidesPerView: 1,
		effect: 'fade',
		fadeEffect: { crossFade: true },
		observer: true,
		observeSlideChildren: true,
	});

	const clearAllProgress = () => {
		slides.forEach(slide => {
			slide.classList.remove('is-active');
			const progress = slide.querySelector('.partner-block__progress');
			if (progress) progress.style.width = '0%';
		});
	};

	const updateSlides = (index) => {
		clearAllProgress();

		slides.forEach((slide, i) => {
			const isActive = i === index;
			slide.classList.toggle('is-active', isActive);

			const countEl = slide.querySelector('.partner-block__right-carousel-count');
			if (countEl) countEl.textContent = (i + 1 < 10 ? `0${i + 1}` : `${i + 1}`);

			// 💥 добавляем явный сброс прогресса у текущего слайда
			if (isActive) {
				const progress = slide.querySelector('.partner-block__progress');
				if (progress) progress.style.width = '0%';
			}
		});

		const targetId = slides[index]?.dataset.changeSlide;
		if (targetId) {
			const targetEl = document.getElementById(targetId);
			if (targetEl) {
				const targetIndex = Array.from(leftSliderEl.querySelectorAll('.swiper-slide')).indexOf(targetEl);
				if (targetIndex >= 0) {
					leftSlider.slideTo(targetIndex);
					leftSlider.update();
				}
			}
		}
	};

	slides.forEach(slide => {
		if (!slide.querySelector('.partner-block__progress')) {
			const progress = document.createElement('div');
			progress.classList.add('partner-block__progress');
			slide.appendChild(progress);
		}
	});

	const animateProgress = (timestamp) => {
		if (paused) return;

		if (!startTime) startTime = timestamp;
		const elapsed = timestamp - startTime;
		const progress = Math.min(elapsed / interval, 1);

		const slide = slides[currentIndex];
		if (!slide) return;

		const progressEl = slide.querySelector('.partner-block__progress');
		if (progressEl) progressEl.style.width = `${progress * 100}%`;

		if (progress < 1) {
			timer = requestAnimationFrame(animateProgress);
		} else {
			currentIndex = (currentIndex + 1) % slides.length;
			updateSlides(currentIndex);
			startProgress(currentIndex);
		}
	};

	const stopProgress = () => {
		if (timer) cancelAnimationFrame(timer);
		timer = null;
		paused = true;
	};

	const startProgress = (index) => {
		stopProgress();
		paused = false;
		startTime = 0;
		currentIndex = index;
		updateSlides(currentIndex);
		timer = requestAnimationFrame(animateProgress);
	};

	let isHovered = false;

	if (wrapper) {
		wrapper.addEventListener('pointerenter', () => {
			isHovered = true;
			stopProgress();
		});

		wrapper.addEventListener('pointerleave', () => {
			isHovered = false;
			startProgress(currentIndex);
		});

		if (wrapper.matches(':hover')) {
			isHovered = true;
			stopProgress();
		}
	}

	slides.forEach((slide, index) => {
		slide.addEventListener('click', () => {
			stopProgress();
			startProgress(index);

			if (wrapper.matches(':hover')) {
				stopProgress();
			}
		});
	});

	startPartnerCarousel = () => {
		stopProgress();
		clearAllProgress();
		currentIndex = 0;
		updateSlides(currentIndex);

		if (!isHovered) {
			startProgress(currentIndex);
		}
	};

	stopPartnerCarousel = () => {
		stopProgress();
		clearAllProgress();

		// 💥 Полный сброс карусели
		const container = document.querySelector('.partner-block__right-carousel');
		if (container) {
			const parent = container.parentElement;
			const clone = container.cloneNode(true);
			container.remove();
			parent.appendChild(clone);
		}
	};

	if (autoStart) {
		startPartnerCarousel();
	}
}




/***/ }),

/***/ "./src/js/modules/modal-slider.js":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getModalSlider: function() { return /* binding */ getModalSlider; },
/* harmony export */   modalSlider: function() { return /* binding */ modalSlider; },
/* harmony export */   swiperReady: function() { return /* binding */ swiperReady; }
/* harmony export */ });
let swiperBig = null;
let swiperReadyResolve;

const swiperReady = new Promise((resolve) => {
	swiperReadyResolve = resolve;
});

function modalSlider() {
	const swiperBigEl = document.querySelector('.modal-inner__slider.swiper');
	const swiperThumbsEl = document.querySelector('.modal-inner__thumbs.swiper');
	if (!swiperBigEl || !swiperThumbsEl) return;

	const thumbsSwiper = new Swiper(swiperThumbsEl, {
		slidesPerView: 'auto',
		spaceBetween: 10,
		slideToClickedSlide: true,
		grabCursor: true,
		centeredSlides: true,
		centeredSlidesBounds: true,
		watchSlidesProgress: true,
		observer: true,
		observeParents: true,
		observeSlideChildren: true,
	});

	swiperBig = new Swiper(swiperBigEl, {
		slidesPerView: 1,
		spaceBetween: 20,
		autoHeight: true,
		speed: 600,
		watchSlidesProgress: true,
		observer: true,
		observeParents: true,
		observeSlideChildren: true,
		on: {
			init: () => {
				swiperReadyResolve();
			}
		},
		thumbs: {
			swiper: thumbsSwiper,
			autoScrollOffset: 1,
			multipleActiveThumbs: false,
		},
		navigation: {
			prevEl: '.modal-inner__group-arrow.swiper-button-prev',
			nextEl: '.modal-inner__group-arrow.swiper-button-next',
		},
	});
}

function getModalSlider() {
	return swiperBig;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	!function() {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = function(chunkId) {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce(function(promises, key) {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	!function() {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = function(chunkId) {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".chunk.js";
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	!function() {
/******/ 		var inProgress = {};
/******/ 		// data-webpack is not used as build has no uniqueName
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = function(url, done, key, chunkId) {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 		
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = function(prev, event) {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach(function(fn) { return fn(event); });
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	!function() {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"index": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = function(chunkId, promises) {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise(function(resolve, reject) { installedChunkData = installedChunks[chunkId] = [resolve, reject]; });
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = function(event) {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {

;// CONCATENATED MODULE: ./src/js/modules/scroll-header.js
function scrollHeader() {
	const header = document.querySelector('.header');
	if (!header) return;

	let lastScroll = window.scrollY;
	let isFixed = false;
	let ticking = false;
	const threshold = 10;

	// Если при загрузке не в самом верху — сразу is-fixed
	if (window.scrollY > 0) {
		header.classList.add('is-fixed');
		isFixed = true;
	}

	const updateHeader = () => {
		const currentScroll = window.scrollY;

		// === Приоритетная проверка: в самом верху ===
		if (currentScroll <= 0) {
			header.classList.remove('is-fixed', 'is-visible');
			isFixed = false;
			lastScroll = 0;
			ticking = false;
			return;
		}

		// === Остальная логика ===
		if (Math.abs(currentScroll - lastScroll) < threshold) {
			ticking = false;
			return;
		}

		const goingDown = currentScroll > lastScroll;

		if (!isFixed) {
			header.classList.add('is-fixed');
			isFixed = true;
		}

		if (goingDown) {
			header.classList.remove('is-visible');
		} else {
			header.classList.add('is-visible');
		}

		lastScroll = currentScroll;
		ticking = false;
	};

	const onScroll = () => {
		if (!ticking) {
			window.requestAnimationFrame(updateHeader);
			ticking = true;
		}
	};

	window.addEventListener('scroll', onScroll);
}

;// CONCATENATED MODULE: ./src/js/modules/burger-menu-aside.js
function burgerMenuAside() {
	const burgerBtn = document.querySelector('.header__content-right-burger');
	const aside = document.querySelector('.header__aside');
	const useEl = burgerBtn?.querySelector('use');
	const headerContent = document.querySelector('.header__content');

	if (!burgerBtn || !aside || !useEl || !headerContent) return;

	const ICON_BURGER = './img/svgsprite/sprite.symbol.svg#icon-burger';
	const ICON_CLOSE = './img/svgsprite/sprite.symbol.svg#icon-close';

	function openMenu() {
		aside.classList.remove('is-closing');
		aside.classList.add('is-open');
		burgerBtn.setAttribute('aria-expanded', 'true');
		aside.setAttribute('aria-expanded', 'true');
		useEl.setAttribute('href', ICON_CLOSE);
		headerContent.classList.add('header__content-open');
		document.body.style.overflow = 'hidden';
	}

	function closeMenu() {
		aside.setAttribute('aria-expanded', 'false');
		aside.classList.remove('is-open');
		burgerBtn.setAttribute('aria-expanded', 'false');
		aside.classList.add('is-closing');
		useEl.setAttribute('href', ICON_BURGER);
		headerContent.classList.remove('header__content-open');
		document.body.style.overflow = '';

		aside.addEventListener(
			'animationend',
			() => {
				aside.classList.remove('is-closing');
			},
			{ once: true }
		);
	}

	burgerBtn.addEventListener('click', () => {
		const isOpen = aside.classList.contains('is-open');
		isOpen ? closeMenu() : openMenu();
	});
}

const closeBurgerMenuWithCallback = _.debounce((callback) => {
	const aside = document.querySelector('.header__aside');
	const burgerBtn = document.querySelector('.header__content-right-burger');
	const useEl = burgerBtn?.querySelector('use');
	const headerContent = document.querySelector('.header__content');

	if (!aside || !burgerBtn || !useEl || !headerContent) return;

	aside.setAttribute('aria-expanded', 'false');
	aside.classList.remove('is-open');
	burgerBtn.setAttribute('aria-expanded', 'false');
	aside.classList.add('is-closing');
	useEl.setAttribute('href', './img/svgsprite/sprite.symbol.svg#icon-burger');
	headerContent.classList.remove('header__content-open');
	document.body.style.overflow = '';

	aside.addEventListener(
		'animationend',
		() => {
			aside.classList.remove('is-closing');
			if (typeof callback === 'function') callback();
		},
		{ once: true }
	);
}, 100);
;// CONCATENATED MODULE: ./src/js/modules/global.js



function Global() {
	gsap.registerPlugin(ScrollTrigger);

	const setVhVar = () => {
		const vh = (window.visualViewport?.height || window.innerHeight) / 100;
		document.documentElement.style.setProperty('--vh', `${vh * 100}px`);
	};

	const debouncedSetVhVar = _.debounce(setVhVar, 200);

	setVhVar();
	window.addEventListener('resize', debouncedSetVhVar);

	const featureButtons = document.querySelectorAll('.new-features__btn');
	const featureTabs = document.querySelector('.new-features__tabs');

	if (featureButtons && featureTabs) {
		featureButtons.forEach((btn) => {
			btn.addEventListener('click', () => {
				const target = btn.getAttribute('data-target');

				if (target === 'partner' || target === 'employee') {
					featureTabs.style.display = 'none';
				} else {
					featureTabs.style.display = '';
				}
			});
		});
	}

	const setHeaderHeight = () => {
		const staticHeader = document.querySelector('.header');
		const headerHeight = staticHeader?.getBoundingClientRect().height ?? 0;
		document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
	};

	const debouncedSetHeaderHeight = _.debounce(setHeaderHeight, 200);
	window.addEventListener('load', setHeaderHeight);
	window.addEventListener('resize', debouncedSetHeaderHeight);

	// === Фикс шапки при скролле ===
	scrollHeader();

	// === ScrollTrigger обновление ===
	// Если ScrollTrigger использует scroll позицию, для базового scroll нет необходимости в custom RAF.
	window.addEventListener('scroll', () => {
		ScrollTrigger.update();
	});

	// === Плавный скролл для якорных ссылок ===
	document.querySelectorAll('[data-action="scroll-block"]').forEach(link => {
		link.addEventListener('click', e => {
			e.preventDefault();

			const href = link.getAttribute('href') || '';
			if (!href.startsWith('#')) return;

			const targetId = href.slice(1);
			const targetEl = document.getElementById(targetId);
			if (!targetEl) return;

			const targetY = targetEl.getBoundingClientRect().top + window.scrollY;

			const aside = document.querySelector('.header__aside');
			const isBurgerOpen = aside?.classList.contains('is-open');
			const isMobile = window.innerWidth <= 1365;

			const scrollToBlock = () => {
				window.scrollTo({
					top: targetY,
					behavior: 'smooth'
				});
			};

			if (isMobile && isBurgerOpen) {
				closeBurgerMenuWithCallback(scrollToBlock);
			} else {
				scrollToBlock();
			}
		});
	});
	document.querySelectorAll('[data-action="simplebar-block"]').forEach(el => {
		new SimpleBar(el);
	});

	// Параллакс с улучшенными настройками и отключённым immediateRender для верхних блоков
	gsap.registerPlugin(ScrollTrigger);

	// Инициализация параллакс анимаций
	document.querySelectorAll('[data-action="parallax-block"]').forEach((el) => {
		const offset = el.dataset.parallaxOffset ? parseFloat(el.dataset.parallaxOffset) : 60;
		el.style.willChange = 'transform';

		gsap.fromTo(
			el,
			{ y: -offset },
			{
				y: offset,
				immediateRender: false,
				ease: 'none',
				scrollTrigger: {
					trigger: el,
					start: 'top 90%',
					end: 'bottom 10%',
					scrub: 1,
					// markers: true, // опция для отладки
				}
			}
		);
	});

	// Обновляем ScrollTrigger после загрузки страницы
	window.addEventListener('load', () => {
		setTimeout(() => {
			ScrollTrigger.refresh();
		}, 100);
	});

	const textarea = document.querySelector('.form-block__content-right-textarea');

	if (textarea) {
		const updateTextareaRows = () => {
			const isMobile = window.innerWidth <= 767;
			textarea.rows = isMobile ? 5 : 7;
		};

		// Троттлим обновление, чтобы не вызывать слишком часто
		const throttledUpdate = _.throttle(updateTextareaRows, 200);

		// Вызываем один раз при загрузке
		updateTextareaRows();

		// Подписываемся на resize с троттлом
		window.addEventListener('resize', throttledUpdate);
	}
}

;// CONCATENATED MODULE: ./src/js/modules/init-magic-line-tabs.js
function initMagicLineTabs(containerSelector) {
	const tabsContainer = document.querySelector(containerSelector);
	if (!tabsContainer) return;

	const buttons = tabsContainer.querySelectorAll('.new-features__btn');
	if (!buttons.length) return;

	function moveLineTo(el) {
		const rect = el.getBoundingClientRect();
		const containerRect = tabsContainer.getBoundingClientRect();

		const offsetLeft = rect.left - containerRect.left;
		const width = rect.width;

		tabsContainer.style.setProperty('--magic-left', `${offsetLeft}px`);
		tabsContainer.style.setProperty('--magic-width', `${width}px`);
	}

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			buttons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			moveLineTo(btn);
		});
	});

	const initialBtn = tabsContainer.querySelector('.new-features__btn.active') || buttons[0];
	if (initialBtn) moveLineTo(initialBtn);
}

;// CONCATENATED MODULE: ./src/js/modules/update-feature-info.js
function updateFeatureInfo() {
	const slides = document.querySelectorAll('.new-features__bottom-slide');
	const titleEl = document.querySelector('[data-action="head-copy"]');
	const textEl = document.querySelector('[data-action="text-copy"]');

	if (!slides.length || !titleEl || !textEl) return;

	slides.forEach(slide => {
		slide.addEventListener('click', () => {
			const heading = slide.querySelector('[data-action="heading-insert"]')?.textContent.trim();
			const text = slide.querySelector('[data-action="text-copy-insert"]')?.value.trim();

			if (heading && text) {
				animateTextDrama(titleEl, heading, 1000);
				animateTextDrama(textEl, text, 1400);
			}
		});
	});
}

function animateTextDrama(el, newText, duration = 600) {
	if (!el || typeof newText !== 'string') return;

	// Очистка предыдущей анимации
	if (el._textAnimationTimeout) {
		clearTimeout(el._textAnimationTimeout);
		delete el._textAnimationTimeout;
	}

	// Сброс transition и transform
	el.style.transition = 'none';
	el.style.opacity = '1';
	el.style.transform = 'translateY(0)';
	el.style.willChange = 'opacity, transform';

	// Стартовая анимация (fade-out + move-down)
	requestAnimationFrame(() => {
		el.style.transition = `opacity ${duration * 0.4}ms ease, transform ${duration * 0.4}ms ease`;
		el.style.opacity = '0';
		el.style.transform = 'translateY(20px)';
	});

	// После выхода — меняем текст и анимируем обратно
	el._textAnimationTimeout = setTimeout(() => {
		el.textContent = newText;

		el.style.transition = `opacity ${duration * 0.6}ms ease, transform ${duration * 0.6}ms ease`;
		el.style.opacity = '1';
		el.style.transform = 'translateY(0)';

		delete el._textAnimationTimeout;
	}, duration * 0.4);
}


// EXTERNAL MODULE: ./src/js/modules/init-partner-carousel.js
var init_partner_carousel = __webpack_require__("./src/js/modules/init-partner-carousel.js");
;// CONCATENATED MODULE: ./src/js/modules/accordion-features.js


let partnerCarouselInitialized = false;

function accordionFeatures() {
	const tabsLinks = document.querySelectorAll('.new-features__btn');
	const tabsContent = document.querySelectorAll('.new-features__content');

	if (tabsLinks.length > 0 && tabsContent.length > 0) {
		tabsLinks.forEach(link => {
			link.addEventListener('click', (event) => {
				event.preventDefault();

				const targetId = link.getAttribute('data-target');

				tabsLinks.forEach(link => link.classList.remove('active'));
				link.classList.add('active');

				tabsContent.forEach(content => {
					const isTarget = content.id === targetId;
					content.setAttribute('aria-expanded', isTarget ? 'true' : 'false');

					// ➖ Отключаем партнёрский слайдер, если уходим
					if (content.id === 'partner' && !isTarget) {
						(0,init_partner_carousel.stopPartnerCarousel)();
					}
				});

				// ✅ Включаем партнёрский слайдер при активации
				if (targetId === 'partner') {
					if (!partnerCarouselInitialized) {
						(0,init_partner_carousel.initPartnerCarousel)();
						partnerCarouselInitialized = true;
					} else {
						// 🧼 Обязательно реинициализируем после полного сброса
						(0,init_partner_carousel.initPartnerCarousel)();
					}
					(0,init_partner_carousel.startPartnerCarousel)();
				}

			});
		});
	}
}

// EXTERNAL MODULE: ./src/js/modules/geography-presence.js
var geography_presence = __webpack_require__("./src/js/modules/geography-presence.js");
;// CONCATENATED MODULE: ./src/js/modules/init-custom-selects.js
function initCustomSelects(onResetCallback) {
	const selects = document.querySelectorAll('.select-filter__item');

	selects.forEach(select => {
		const btn = select.querySelector('.select-filter__btn');
		const dropdown = select.querySelector('.select-filter__flex');
		const iconUse = btn?.querySelector('.icon__select use');
		const applyBtn = dropdown?.querySelector('.select-filter__apply');
		const inputs = dropdown?.querySelectorAll('.select-filter__dropdown-input');

		let hasSelection = false;

		if (!btn || !dropdown || !iconUse || !applyBtn || !inputs) return;

		// === ОТКРЫТИЕ/ЗАКРЫТИЕ ===
		btn.addEventListener('click', (e) => {
			const isIconClick = e.target.closest('svg.icon__select');
			const isOpen = dropdown.getAttribute('aria-expanded') === 'true';

			if (isIconClick && hasSelection && !isOpen) {
				// === СБРОС ===
				inputs.forEach(input => (input.checked = false));
				applyBtn.disabled = true;

				// Удаляем счетчик, если он есть
				const countSpan = btn.querySelector('.select-filter__count');
				if (countSpan) {
					countSpan.remove();
				}

				hasSelection = false;

				iconUse.setAttribute('href', './img/svgsprite/sprite.symbol.svg#icon-arrow__select');

				// Вызываем коллбэк сброса (например, сброс карты)
				if (typeof onResetCallback === 'function') {
					onResetCallback();
				}

				return;
			}

			closeAllSelects();

			if (!isOpen) {
				dropdown.setAttribute('aria-expanded', 'true');
				btn.classList.add('is-active');
			} else {
				dropdown.setAttribute('aria-expanded', 'false');
				btn.classList.remove('is-active');
			}
		});


		// === КЛИК ВНЕ, ЗАКРЫВАЕМ ===
		document.addEventListener('click', (e) => {
			if (!select.contains(e.target)) {
				dropdown.setAttribute('aria-expanded', 'false');
				btn.classList.remove('is-active');
			}
		});

		// === ОТСЛЕЖИВАЕМ ИЗМЕНЕНИЯ ===
		inputs.forEach(input => {
			input.addEventListener('change', () => {
				const anyChecked = [...inputs].some(i => i.checked);
				applyBtn.disabled = !anyChecked;
			});
		});

		// === ПРИМЕНИТЬ ===
		applyBtn.addEventListener('click', () => {
			const checkedCount = [...inputs].filter(i => i.checked).length;
			updateSelectSummary(btn, checkedCount);

			hasSelection = checkedCount > 0;

			dropdown.setAttribute('aria-expanded', 'false');
			btn.classList.remove('is-active');

			iconUse.setAttribute(
				'href',
				hasSelection
					? './img/svgsprite/sprite.symbol.svg#icon-close'
					: './img/svgsprite/sprite.symbol.svg#icon-arrow__select'
			);
		});
	});
}

function closeAllSelects() {
	document.querySelectorAll('.select-filter__flex[aria-expanded="true"]').forEach(drop => {
		drop.setAttribute('aria-expanded', 'false');
	});

	document.querySelectorAll('.select-filter__btn.is-active').forEach(btn => {
		btn.classList.remove('is-active');
	});
}

function updateSelectSummary(btn, count) {
	const labelSpan = btn.querySelector('.select-filter__btn-choose');
	let countSpan = btn.querySelector('.select-filter__count');

	if (!labelSpan) return;

	if (!countSpan) {
		countSpan = document.createElement('span');
		countSpan.className = 'select-filter__count';

		const icon = btn.querySelector('.icon__select');
		if (icon) {
			btn.insertBefore(countSpan, icon);
		} else {
			btn.appendChild(countSpan);
		}
	}

	countSpan.textContent = count === 0 ? '' : `${count}`;
}

;// CONCATENATED MODULE: ./src/js/modules/init-magic-line-tabs-form.js
function initMagicLineTabsForm(containerSelector) {
	const tabsContainer = document.querySelector(containerSelector);
	// console.log('tabsContainer', tabsContainer);

	if (!tabsContainer) return;

	const buttons = tabsContainer.querySelectorAll('.form-block__content-right-btn');
	if (!buttons.length) return;

	function moveLineTo(el) {
		const rect = el.getBoundingClientRect();
		const containerRect = tabsContainer.getBoundingClientRect();

		const offsetLeft = rect.left - containerRect.left;
		const width = rect.width;

		tabsContainer.style.setProperty('--magic-left-form', `${offsetLeft}px`);
		tabsContainer.style.setProperty('--magic-width-form', `${width}px`);
	}

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			buttons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			moveLineTo(btn);
		});
	});

	const initialBtn = tabsContainer.querySelector('.form-block__content-right-btn.active') || buttons[0];
	if (initialBtn) moveLineTo(initialBtn);
}

;// CONCATENATED MODULE: ./src/js/modules/phone-mask.js
const phoneInputs = document.querySelectorAll('input[type="tel"]');
const COUNTRY_CODE = '+7';
const phone_mask_length = COUNTRY_CODE.length;
const PLACEHOLDER_MASK = '+7 (___) ___-__-__';

const replacePhoneValue = (el) => {
	const matrix = PLACEHOLDER_MASK;
	const def = matrix.replace(/\D/g, '');
	let i = 0;
	let val = el.value.replace(/\D/g, '');
	if (def.length >= val.length) {
		val = def;
	}
	el.value = matrix.replace(/./g, (a) => {
		return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? '' : a;
	});
};

const onInputPhoneInput = ({ target }) => {
	replacePhoneValue(target);
};

const onFocusPhoneInput = ({ target }) => {
	if (!target.value) {
		target.value = '+7 (';
		target.addEventListener('input', onInputPhoneInput);
		target.addEventListener('blur', onBlurPhoneInput);
		target.addEventListener('keydown', onKeydownPhoneInput);
	}
};


const onKeydownPhoneInput = (e) => {
	if (e.target.selectionStart <= phone_mask_length && e.keyCode !== 8 && e.keyCode !== 46) {
		e.target.setSelectionRange(phone_mask_length, phone_mask_length);
	}
	if ((e.target.selectionStart === phone_mask_length || e.target.selectionStart === 1) && e.keyCode === 8) {
		e.preventDefault();
	}
	if (e.target.selectionStart === 1 && e.keyCode === 46) {
		e.preventDefault();
	}
};

const onBlurPhoneInput = ({ target }) => {
	if (target.value === COUNTRY_CODE || target.value.trim() === '') {
		target.value = '';
		target.placeholder = '';
		target.removeEventListener('input', onInputPhoneInput);
		target.removeEventListener('blur', onBlurPhoneInput);
	}
};

const initPhoneMask = () => {
	if (phoneInputs.length) {
		phoneInputs.forEach((input) => {
			input.addEventListener('focus', onFocusPhoneInput);
			if (input.value) {
				replacePhoneValue(input);
				input.addEventListener('input', onInputPhoneInput);
				input.addEventListener('blur', onBlurPhoneInput);
				input.addEventListener('keydown', onKeydownPhoneInput);
			}
		});
	}
};



;// CONCATENATED MODULE: ./src/js/modules/auto-resize-textarea.js
const initializedTextAreas = [];
let isResizeEventSet = false;

const getHeightWithoutBorder = (el) => {
	let realScrollHeight = el.scrollHeight;

	if (!el.value) {
		el.value = 0;
		realScrollHeight = el.scrollHeight;
		el.value = '';
	}

	return realScrollHeight + el.offsetHeight - el.clientHeight;
};

const resizeHeight = (el) => {
	el.style.height = 'auto';
	el.style.height = `${getHeightWithoutBorder(el)}px`;
};

const initAutoResizeTextarea = () => {
	const textAreas = document.querySelectorAll('.auto-resize-textarea textarea:not(.is-initialized)');

	if (!textAreas.length) {
		return;
	}

	textAreas.forEach((el) => {
		initializedTextAreas.push(el);
		el.classList.add('is-initialized');
		el.style.overflow = 'hidden';
		el.style.resize = 'none';
		resizeHeight(el);

		el.addEventListener('input', () => {
			resizeHeight(el);
		});

		const form = el.closest('form');

		if (form) {
			form.addEventListener('submit', () => {
				resizeHeight(el);
			});
		}
	});

	if (!isResizeEventSet) {
		isResizeEventSet = true;
		window.addEventListener('resize', () => {
			initializedTextAreas.forEach((el) => {
				resizeHeight(el);
			});
		});
	}
};

window.initAutoResizeTextarea = initAutoResizeTextarea;


;// CONCATENATED MODULE: ./src/js/modules/enhance-partner-ship-form.js
function enhancePartnershipForm() {
	const form = document.querySelector('#form-block-main');
	if (!form) return;

	const inputs = form.querySelectorAll('.required-field');
	const submitButton = form.querySelector('.form-block__content-right-btn-send');
	const buttonSpan = submitButton?.querySelector('span');
	const phoneInput = form.querySelector('#main__field__phone');
	const emailInput = form.querySelector('#main__field__email');

	if (!submitButton || !buttonSpan) return;

	form.addEventListener('focusin', (e) => {
		const wrapper = e.target.closest('li');
		if (wrapper) wrapper.classList.add('is-active');
	});

	form.addEventListener('focusout', (e) => {
		if (e.target.value?.trim() === '') {
			const wrapper = e.target.closest('li');
			if (wrapper) wrapper.classList.remove('is-active');
		}
	});

	function showError(input, customMessage = '') {
		clearError(input);

		const wrapper = input.closest('li');
		const label = wrapper?.querySelector('.form-block__content-right-label')?.textContent?.replace('*', '').trim() || 'значение';
		let message = customMessage;

		if (!customMessage) {
			let word = label.toLowerCase();
			if (word === 'имя') {
				word = 'имя полностью';
			} else if (word.endsWith('ия')) {
				word = word.replace(/ия$/, 'ию');
			} else if (word.endsWith('а')) {
				word = word.replace(/а$/, 'у');
			} else if (word.endsWith('я')) {
				word = word.replace(/я$/, 'ю');
			}
			message = `Необходимо указать ${word}`;
		}

		const errorSpan = document.createElement('span');
		errorSpan.className = 'form-error form-block__content-right-error';
		errorSpan.style.color = 'red';
		errorSpan.textContent = message;

		input.classList.add('has-error');
		wrapper?.classList.add('form-block__content-right-li--error');
		input.parentNode?.appendChild(errorSpan);
	}

	function clearError(input) {
		const wrapper = input.closest('li');
		const error = input.parentNode?.querySelector('.form-error');
		if (error) error.remove();
		input.classList.remove('has-error');
		wrapper?.classList.remove('form-block__content-right-li--error');
	}

	function isPhoneComplete(value) {
		return /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value.trim());
	}

	function isEmailValid(value) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
	}

	function validateInput(input) {
		const value = input.value.trim();
		const id = input.id;

		if (!value) {
			showError(input);
			return false;
		}

		if (id === 'main__field__phone' && !isPhoneComplete(value)) {
			showError(input, 'Телефон должен быть заполнен полностью');
			return false;
		}

		if (id === 'main__field__email' && !isEmailValid(value)) {
			showError(input, 'Введите корректный email');
			return false;
		}

		if (id === 'main__field__city' && /\d/.test(value)) {
			showError(input, 'Название города не должно содержать цифры');
			return false;
		}

		if ((id === 'main__field__name' || id === 'main__field__surname')) {
			if (value.length < 2) {
				const label = input.closest('li')?.querySelector('.form-block__content-right-label')?.textContent?.trim().toLowerCase();
				showError(input, `Необходимо указать ${label} полностью`);
				return false;
			}
			if (!/^[А-Яа-яЁёA-Za-z]+$/u.test(value)) {
				showError(input, 'Разрешены только буквы');
				return false;
			}
		}

		if (id === 'main__field__employees' && !/^\d+$/.test(value)) {
			showError(input, 'Введите только цифры');
			return false;
		}

		clearError(input);
		return true;
	}

	form.addEventListener('input', () => {
		const anyFilled = Array.from(inputs).some(input => input.value.trim() !== '');
		submitButton.disabled = !anyFilled;
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		let isValid = true;
		let firstInvalidInput = null;

		const visibleInputs = Array.from(inputs).filter(input => input.offsetParent !== null);

		for (const input of visibleInputs) {
			const result = validateInput(input);
			if (!result && !firstInvalidInput) {
				firstInvalidInput = input;
			}
			if (!result) isValid = false;
		}

		if (!isValid && firstInvalidInput) {
			const wrapper = firstInvalidInput.closest('li');
			if (wrapper) {
				wrapper.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			}
			return;
		}

		submitButton.disabled = true;
		const originalText = buttonSpan.textContent;
		buttonSpan.textContent = 'Идёт отправка...';

		try {
			const formData = new FormData(form);
			const response = await fetch(form.action, {
				method: form.method,
				body: formData,
			});

			if (response.ok) {
				const template = document.getElementById('form-success-template');
				if (template) {
					const clone = template.content.cloneNode(true);
					const notification = clone.querySelector('.form-success-notification');
					const closeBtn = clone.querySelector('.form-success-notification__btn');

					if (notification) {
						form.appendChild(clone);

						closeBtn?.addEventListener('click', () => {
							notification.classList.add('slide-out');
							setTimeout(() => notification.remove(), 1000);
						});

						setTimeout(() => {
							notification.classList.add('slide-out');
							setTimeout(() => notification.remove(), 1000);
						}, 5000);
					}
				}

				form.reset();
				inputs.forEach(clearError);
				submitButton.disabled = true;
				form.querySelectorAll('li.is-active').forEach(li => li.classList.remove('is-active'));
			} else {
				throw new Error('Сервер вернул ошибку');
			}
		} catch (error) {
			const template = document.getElementById('form-error-template');
			if (template) {
				const clone = template.content.cloneNode(true);
				const notification = clone.querySelector('.form-error-notification');
				const closeBtn = clone.querySelector('.form-error-notification__btn');

				if (notification) {
					form.appendChild(clone);

					closeBtn?.addEventListener('click', () => {
						notification.classList.add('slide-out');
						setTimeout(() => notification.remove(), 1000);
					});

					setTimeout(() => {
						notification.classList.add('slide-out');
						setTimeout(() => notification.remove(), 1000);
					}, 5000);
				}
			}
		} finally {
			buttonSpan.textContent = originalText;
			submitButton.disabled = false;
		}
	});
}

;// CONCATENATED MODULE: ./src/js/modules/init-form-type-switcher.js
function initFormTypeSwitcher(containerSelector) {
	const container = document.querySelector(containerSelector);
	if (!container) return;

	const buttons = container.querySelectorAll('.form-block__content-right-btn');
	const form = container.querySelector('form');
	const hiddenInput = form.querySelector('input[name="form-block"]');

	const fieldCity = form.querySelector('[data-action="field-city"]');
	const fieldEmployees = form.querySelector('[data-action="field-employees"]');

	const toggleFields = (type) => {
		if (type === 'partner') {
			fieldCity.classList.remove('will-be-hidden');
			fieldEmployees.classList.add('hidden-field');
		} else if (type === 'company') {
			fieldCity.classList.add('will-be-hidden');
			fieldEmployees.classList.remove('hidden-field');
		}
	};

	buttons.forEach((btn) => {
		btn.addEventListener('click', () => {
			const formType = btn.dataset.form;

			// Обновляем активные кнопки
			buttons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');

			// Обновляем hidden input
			if (hiddenInput) {
				hiddenInput.value = formType;
			}

			// Переключаем поля
			toggleFields(formType);
		});
	});

	// инициализируем по умолчанию
	const activeBtn = container.querySelector('.form-block__content-right-btn.active');
	if (activeBtn) {
		const defaultType = activeBtn.dataset.form;
		if (hiddenInput) hiddenInput.value = defaultType;
		toggleFields(defaultType);
	}
}

;// CONCATENATED MODULE: ./src/js/modules/ios-checker.js
const iosChecker = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
};

;// CONCATENATED MODULE: ./src/js/modules/scroll-lock.js


class ScrollLock {
  constructor() {
    this._iosChecker = iosChecker;
    this._isIOS = this._iosChecker();
    this._lockClass = this._isIOS ? 'scroll-lock-ios' : 'scroll-lock';
    this._scrollTop = 0;
    this._fixedBlockElements = document.querySelectorAll('[data-fix-block]');
  }

  _getScrollbarWidth() {
    // На мобильных (overlay scrollbars) чаще всего 0 — не компенсируем
    return window.innerWidth - document.documentElement.clientWidth;
  }

  _getBodyScrollTop() {
    return (
      window.pageYOffset ??
      document.documentElement.scrollTop ??
      document.body.scrollTop ??
      0
    );
  }

  disableScrolling() {
    // Запоминаем текущий скролл один раз
    if (!document.body.dataset.scroll) {
      this._scrollTop = this._getBodyScrollTop();
      document.body.dataset.scroll = String(this._scrollTop);
    } else {
      this._scrollTop = Number(document.body.dataset.scroll) || 0;
    }

    const scrollbarWidth = this._getScrollbarWidth();

    if (scrollbarWidth > 0 && !this._isIOS) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      this._fixedBlockElements.forEach((block) => {
        block.style.paddingRight = `${scrollbarWidth}px`;
      });
    }

    document.body.style.top = `-${this._scrollTop}px`;
    document.body.classList.add(this._lockClass);

    document.dispatchEvent(new CustomEvent('modalOpen', { bubbles: false }));
  }

  enableScrolling() {
    document.body.classList.remove(this._lockClass);

    const saved = Number(document.body.dataset.scroll) || 0;
    window.scrollTo(0, saved);

    document.body.style.paddingRight = '';
    document.body.style.top = '';
    this._fixedBlockElements.forEach((block) => {
      block.style.paddingRight = '';
    });

    document.body.removeAttribute('data-scroll');
    this._scrollTop = 0;

    document.dispatchEvent(new CustomEvent('modalClose', { bubbles: false }));
  }
}

window.scrollLock = new ScrollLock();

;// CONCATENATED MODULE: ./src/js/modules/focus-lock.js
const SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])'
];

class FocusLock {
  constructor() {
    this._lockedSelector = null;
    this._focusableElements = null;
    this._endElement = null;
    this._selectors = SELECTORS;

    this._documentKeydownHandler = this._documentKeydownHandler.bind(this);
  }

  _documentKeydownHandler(evt) {
    const activeElement = document.activeElement;
    if (evt.key === 'Tab') {
      if (!this._focusableElements.length) {
        evt.preventDefault();
        activeElement.blur();
        return;
      }
      if (this._focusableElements.length === 1) {
        evt.preventDefault();
        this._focusableElements[0].focus();
        return;
      }
      if (this._focusableElements.length > 1 && !activeElement.closest(this._lockedSelector)) {
        evt.preventDefault();
        this._focusableElements[0].focus();
        return;
      }
    }
    if (evt.key === 'Tab' && !evt.shiftKey && activeElement === this._focusableElements[this._focusableElements.length - 1]) {
      evt.preventDefault();
      this._focusableElements[0].focus();
    }
    if (evt.key === 'Tab' && evt.shiftKey && activeElement === this._focusableElements[0]) {
      evt.preventDefault();
      this._focusableElements[this._focusableElements.length - 1].focus();
    }
  }

  lock(lockedSelector, startFocus = true) {
    this.unlock();
    this._lockedSelector = lockedSelector;
    const lockedElement = document.querySelector(this._lockedSelector);
    if (!lockedElement) {
      return;
    }
    this._focusableElements = lockedElement.querySelectorAll(this._selectors);
    this._endElement = document.activeElement;
    const startElement = lockedElement.querySelector('[data-focus]') || this._focusableElements[0];
    if (this._endElement) {
      this._endElement.blur();
    }
    if (startElement && startFocus) {
      startElement.focus();
    }
    document.addEventListener('keydown', this._documentKeydownHandler);
  }

  unlock(returnFocus = true) {
    if (this._endElement && returnFocus) {
      this._endElement.focus();
    }
    this._lockedSelector = null;
    this._focusableElements = null;
    this._endElement = null;
    document.removeEventListener('keydown', this._documentKeydownHandler);
  }
}

window.focusLock = new FocusLock();

;// CONCATENATED MODULE: ./src/js/modules/modals.js



class Modals {
  constructor(settings = {}) {
    this._scrollLock = new ScrollLock();
    this._focusLock = new FocusLock();

    this._modalOpenElements = document.querySelectorAll('[data-open-modal]');
    this._stackModalElements = [];
    this._openedModalElement = null;
    this._modalName = null;
    this._enableScrolling = true;
    this._settingKey = 'default';

    this._settings = settings;
    this._preventDefault = this._settings[this._settingKey].preventDefault;
    this._stopPlay = this._settings[this._settingKey].stopPlay;
    this._lockFocus = this._settings[this._settingKey].lockFocus;
    this._startFocus = this._settings[this._settingKey].startFocus;
    this._focusBack = this._settings[this._settingKey].focusBack;
    this._eventTimeout = this._settings[this._settingKey].eventTimeout;
    this._resetScrollPos = this._settings[this._settingKey].resetScrollPos;
    this._openCallback = this._settings[this._settingKey].openCallback;
    this._closeCallback = this._settings[this._settingKey].closeCallback;

    this._documentKeydownHandler = this._documentKeydownHandler.bind(this);
    this._documentClickHandler = this._documentClickHandler.bind(this);
    this._modalClickHandler = this._modalClickHandler.bind(this);

    this._init();
  }

  _init() {
    if (this._modalOpenElements.length) {
      document.addEventListener('click', this._documentClickHandler);
    }
  }

  _setSettings(settingKey = this._settingKey) {
    if (!this._settings[settingKey]) {
      return;
    }

    this._preventDefault =
      typeof this._settings[settingKey].preventDefault === 'boolean'
        ? this._settings[settingKey].preventDefault
        : this._settings[this._settingKey].preventDefault;
    this._stopPlay =
      typeof this._settings[settingKey].stopPlay === 'boolean'
        ? this._settings[settingKey].stopPlay
        : this._settings[this._settingKey].stopPlay;
    this._lockFocus =
      typeof this._settings[settingKey].lockFocus === 'boolean'
        ? this._settings[settingKey].lockFocus
        : this._settings[this._settingKey].lockFocus;
    this._startFocus =
      typeof this._settings[settingKey].startFocus === 'boolean'
        ? this._settings[settingKey].startFocus
        : this._settings[this._settingKey].startFocus;
    this._focusBack =
      typeof this._settings[settingKey].lockFocus === 'boolean'
        ? this._settings[settingKey].focusBack
        : this._settings[this._settingKey].focusBack;
    this._resetScrollPos =
      typeof this._settings[settingKey].resetScrollPos === 'boolean'
        ? this._settings[settingKey].resetScrollPos
        : this._settings[this._settingKey].resetScrollPos;
    this._eventTimeout =
      typeof this._settings[settingKey].eventTimeout === 'number'
        ? this._settings[settingKey].eventTimeout
        : this._settings[this._settingKey].eventTimeout;
    this._openCallback = this._settings[settingKey].openCallback || this._settings[this._settingKey].openCallback;
    this._closeCallback = this._settings[settingKey].closeCallback || this._settings[this._settingKey].closeCallback;
  }

  _documentClickHandler(evt) {
    const target = evt.target;

    if (!target.closest('[data-open-modal]')) {
      return;
    }

    evt.preventDefault();

    this._modalName = target.closest('[data-open-modal]').dataset.openModal;

    if (!this._modalName) {
      return;
    }

    this.open();
  }

  _documentKeydownHandler(evt) {
    const isEscKey = evt.key === 'Escape' || evt.key === 'Esc';

    if (isEscKey) {
      evt.preventDefault();
      this.close(document.querySelector('.modal.is-active').dataset.modal);
    }
  }

  _modalClickHandler(evt) {
    const target = evt.target;

    if (!target.closest('[data-close-modal]')) {
      return;
    }

    if (target.closest('[data-close-modal="back"]')) {
      this.back();
    } else {
      this.close(target.closest('[data-modal]').dataset.modal);
      this._stackModalElements = [];
    }
  }

  _addListeners(modal) {
    modal.addEventListener('click', this._modalClickHandler);
    document.addEventListener('keydown', this._documentKeydownHandler);
  }

  _removeListeners(modal) {
    modal.removeEventListener('click', this._modalClickHandler);
    document.removeEventListener('keydown', this._documentKeydownHandler);
  }

  _stopInteractive(modal) {
    if (this._stopPlay) {
      modal.querySelectorAll('video, audio').forEach((el) => el.pause());
      modal.querySelectorAll('[data-iframe]').forEach((el) => {
        el.querySelector('iframe').contentWindow.postMessage('{"event": "command", "func": "pauseVideo", "args": ""}', '*');
      });
    }
  }

  _autoPlay(modal) {
    modal.querySelectorAll('[data-iframe]').forEach((el) => {
      const autoPlay = el.closest('[data-auto-play]');
      if (autoPlay) {
        el.querySelector('iframe').contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
    });
  }

  open(modalName = this._modalName) {
    const modal = document.querySelector(`[data-modal="${modalName}"]`);

    if (!modal || modal.classList.contains('is-active')) {
      return;
    }

    document.removeEventListener('click', this._documentClickHandler);

    this._openedModalElement = document.querySelector('.modal.is-active');

    if (this._openedModalElement) {
      this._enableScrolling = false;
      this.close(this._openedModalElement.dataset.modal);
    }

    this._setSettings(modalName);
    modal.classList.add('is-active');

    if (modalName !== this._stackModalElements[this._stackModalElements.length - 1]) {
      this._stackModalElements.push(modalName);
    }

    if (!this._openedModalElement) {
      this._scrollLock.disableScrolling();
    }

    if (this._openCallback) {
      this._openCallback();
    }

    if (this._lockFocus) {
      this._focusLock.lock('.modal.is-active', this._startFocus);
    }

    if (this._resetScrollPos) {
      modal.scrollTo(0, 0);
    }

    setTimeout(() => {
      this._addListeners(modal);
      this._autoPlay(modal);
      document.addEventListener('click', this._documentClickHandler);
    }, this._eventTimeout);
  }

  back() {
    if (!this._stackModalElements.length) {
      return;
    }

    const activeModal = this._stackModalElements[this._stackModalElements.length - 1];
    const prevModal = this._stackModalElements[this._stackModalElements.length - 2];

    if (this._stackModalElements.length === 1) {
      this._stackModalElements = [];
    }

    if (prevModal) {
      this._stackModalElements.pop();
      this.open(prevModal);
    }

    this.close(activeModal);
  }

  close(modalName = this._modalName) {
    const modal = document.querySelector(`[data-modal="${modalName}"]`);
    document.removeEventListener('click', this._documentClickHandler);

    if (!modal || !modal.classList.contains('is-active')) {
      return;
    }

    if (this._lockFocus) {
      this._focusLock.unlock(this._focusBack);
    }

    modal.classList.remove('is-active');
    this._removeListeners(modal);
    this._stopInteractive(modal);

    if (this._closeCallback) {
      this._closeCallback();
    }

    if (this._enableScrolling) {
      setTimeout(() => {
        this._scrollLock.enableScrolling();
      }, this._eventTimeout);
    }

    setTimeout(() => {
      document.addEventListener('click', this._documentClickHandler);
    }, this._eventTimeout);

    this._setSettings('default');
    this._enableScrolling = true;
  }
}

;// CONCATENATED MODULE: ./src/js/modules/init-modals.js


let modals;

const settings = {
  'default': {
    preventDefault: true,
    stopPlay: true,
    lockFocus: true,
    startFocus: true,
    focusBack: true,
    resetScrollPos: false,
    eventTimeout: 400,
    openCallback: false,
    closeCallback: false,
  },
  'modal-1': {
    openCallback: () => console.log('Я отработаю при открытии modal-1'),
    closeCallback: () => console.log('Я отработаю при закрытии modal-1'),
  },
};

const initModals = () => {
  const modalElements = document.querySelectorAll('.modal');
  if (modalElements.length) {
    modalElements.forEach((el) => {
      setTimeout(() => {
        el.classList.remove('modal--preload');
      }, 100);
    });
  }

  modals = new Modals(settings);
  window.modals = modals;
};



;// CONCATENATED MODULE: ./src/js/modules/enhance-review-blocks.js
function enhanceReviewBlocks() {
	const MAX_LENGTH = 320;
	const blocks = document.querySelectorAll('.reviews-slider__content-right-text');

	blocks.forEach((block) => {
		const container = block.querySelector('.reviews-slider__content-right-div');
		if (!container) return;

		const text = container.textContent.trim().replace(/s+/g, ' ');
		if (text.length <= MAX_LENGTH) return;

		if (block.querySelector('.reviews-slider__content-right-modal')) return;

		const slide = block.closest('.reviews-slider__content-right-slide');
		const reviewId = slide?.dataset.id;
		if (!reviewId) return;

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'reviews-slider__content-right-modal';
		button.setAttribute('aria-label', 'Читать подробнее');

		button.dataset.reviewId = reviewId;

		button.dataset.openModal = 'modal-reviews';

		button.innerHTML = '<span>Читать подробнее</span>';
		container.appendChild(button);
	});
}

document.addEventListener('click', (e) => {
	const btn = e.target.closest('.reviews-slider__content-right-modal');
	if (!btn) return;

	// Сбрасываем глобальное состояние, если необходимо
	window.__targetReviewId = btn.dataset.reviewId;
	console.log(window.__targetReviewId);

	const reviewId = btn.dataset.reviewId;
	if (!reviewId) return;

	const modal = document.querySelector('[data-modal="modal-reviews"]');
	if (!modal) return;

	// Допустим, твои слайды расположены в контейнере с классом .reviews-slider
	const sliderContainer = document.querySelector('.reviews-slider');
	const slide = sliderContainer.querySelector(`.reviews-slider__content-right-slide[data-id="${reviewId}"]`);

	const modalBody = modal.querySelector('.modal__body');
	if (slide && modalBody) {
		modalBody.innerHTML =
			slide.querySelector('.reviews-slider__content-right-div')?.innerHTML || '';
	}
});
// EXTERNAL MODULE: ./src/js/modules/modal-slider.js
var modal_slider = __webpack_require__("./src/js/modules/modal-slider.js");
;// CONCATENATED MODULE: ./src/js/modules/enable-ajax-modal-loading.js



function enableAjaxModalLoading() {
	document.addEventListener('click', async (evt) => {
		const trigger = evt.target.closest('[data-open-modal]');
		if (!trigger) return;

		const modalId = trigger.dataset.openModal;
		if (!modalId) return;

		const modalAlreadyExists = document.querySelector(`[data-modal="${modalId}"]`);

		if (modalAlreadyExists) {
			await modal_slider.swiperReady;
			modals.open(modalId);

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTimeout(scrollToSlideIfNeeded, 30);
				});
			});

			return;
		}

		try {
			const response = await fetch('./modal.html');
			if (!response.ok) throw new Error(`Ошибка загрузки modal.html: ${response.status}`);

			const html = await response.text();
			const wrapper = document.createElement('div');
			wrapper.innerHTML = html.trim();

			const modalEl = wrapper.querySelector(`[data-modal="${modalId}"]`);
			if (!modalEl) {
				console.error(`Модалка с data-modal="${modalId}" не найдена в modal.html`);
				return;
			}

			document.body.appendChild(modalEl);

			setTimeout(() => modalEl.classList.remove('modal--preload'), 100);

			(0,modal_slider.modalSlider)();

			await modal_slider.swiperReady;
			modals.open(modalId);

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTimeout(scrollToSlideIfNeeded, 30);
				});
			});
		} catch (err) {
			console.error('Ошибка при загрузке модалки:', err);
		}
	});
}

function scrollToSlideIfNeeded() {
	const swiper = (0,modal_slider.getModalSlider)();
	const reviewId = window.__targetReviewId;
	if (!swiper || !reviewId) return;

	const targetEl = document.getElementById(reviewId);
	if (!targetEl) return;

	const targetSlide = targetEl.closest('.swiper-slide');
	if (!targetSlide) return;

	const index = swiper.slides.findIndex((slide) => slide === targetSlide);
	if (index !== -1) {
		swiper.update(); // на случай, если DOM был изменён
		swiper.slideTo(index, 0);
	}
}

;// CONCATENATED MODULE: ./src/js/modules/enhance-partnership-form.js


function enhanceModalForm(modalSelector) {
	const modal = document.querySelector(modalSelector);
	if (!modal) return;

	const form = modal.querySelector('form');
	const inputs = form.querySelectorAll('.required-field');
	const submitButton = form.querySelector('button[type="submit"]');
	const buttonSpan = submitButton.querySelector('span');

	form.addEventListener('focusin', (e) => {
		const wrapper = e.target.closest('li');
		if (wrapper) wrapper.classList.add('is-active');
	});

	form.addEventListener('focusout', (e) => {
		const target = e.target;
		if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;

		if (target.value.trim() === '') {
			const wrapper = target.closest('li');
			if (wrapper) wrapper.classList.remove('is-active');
		}
	});


	function showError(input, customMessage = '') {
		clearError(input);

		const wrapper = input.closest('li');
		const label = wrapper?.querySelector('label')?.textContent?.trim() || 'значение';
		let message = customMessage;

		if (!customMessage) {
			let word = label.toLowerCase();
			if (word === 'имя') word = 'имя полностью';
			else if (word.endsWith('ия')) word = word.replace(/ия$/, 'ию');
			else if (word.endsWith('а')) word = word.replace(/а$/, 'у');
			else if (word.endsWith('я')) word = word.replace(/я$/, 'ю');
			message = `Необходимо указать ${word}`;
		}

		const errorSpan = document.createElement('span');
		errorSpan.className = 'form-error modal-callback__error';
		errorSpan.textContent = message;

		input.classList.add('has-error');
		wrapper?.classList.add('modal-callback__item--error');
		input.parentNode.appendChild(errorSpan);
	}

	function clearError(input) {
		const wrapper = input.closest('li');
		const error = input.parentNode.querySelector('.form-error');
		if (error) error.remove();
		input.classList.remove('has-error');
		wrapper?.classList.remove('modal-callback__item--error');
	}

	function isPhoneComplete(value) {
		return /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value.trim());
	}

	function isEmailValid(value) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
	}

	function validateInput(input) {
		const value = input.value.trim();
		const id = input.id;

		if (!value) {
			showError(input);
			return false;
		}

		if (id === 'modal-callback-phone' && !isPhoneComplete(value)) {
			showError(input, 'Телефон должен быть заполнен полностью');
			return false;
		}

		if (id === 'modal-callback-email' && !isEmailValid(value)) {
			showError(input, 'Введите корректный email');
			return false;
		}

		if (id === 'modal-callback-name') {
			if (value.length < 2) {
				showError(input, 'Необходимо указать имя полностью');
				return false;
			}
			if (!/^[А-Яа-яЁёA-Za-z]+$/u.test(value)) {
				showError(input, 'Разрешены только буквы');
				return false;
			}
		}

		clearError(input);
		return true;
	}

	form.addEventListener('input', () => {
		const anyFilled = Array.from(inputs).some(input => input.value.trim() !== '');
		submitButton.disabled = !anyFilled;
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		let isValid = true;
		let firstInvalidInput = null;

		const visibleInputs = Array.from(inputs).filter(input => input.offsetParent !== null);

		visibleInputs.forEach(input => {
			const result = validateInput(input);
			if (!result && !firstInvalidInput) {
				firstInvalidInput = input;
			}
			if (!result) isValid = false;
		});

		if (!isValid && firstInvalidInput) {
			firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
			return;
		}

		submitButton.disabled = true;
		const originalText = buttonSpan.textContent;
		buttonSpan.textContent = 'Идёт отправка...';

		try {
			const formData = new FormData(form);
			const response = await fetch(form.action, {
				method: form.method,
				body: formData,
			});

			if (response.ok) {
				showGlobalNotification('form-success-template');
				form.reset();
				inputs.forEach(clearError);
				submitButton.disabled = true;
			} else {
				throw new Error('Ошибка сервера');
			}
		} catch (error) {
			showGlobalNotification('form-error-template');
		} finally {
			buttonSpan.textContent = originalText;
			submitButton.disabled = false;

			const modalId = modal.getAttribute('data-modal');
			if (modalId && modals) {
				modals.close(modalId);
			}
		}
	});
}

function showGlobalNotification(templateId) {
	const template = document.getElementById(templateId);
	if (!template) return;

	const clone = template.content.cloneNode(true);
	const notification = clone.querySelector('[class*="notification"]');
	const closeBtn = notification.querySelector('[class*="__btn"]');

	document.body.appendChild(clone);

	closeBtn?.addEventListener('click', () => {
		notification.classList.add('slide-out');
		setTimeout(() => notification.remove(), 1000);
	});

	setTimeout(() => {
		notification.classList.add('slide-out');
		setTimeout(() => notification.remove(), 1000);
	}, 5000);
}

;// CONCATENATED MODULE: ./src/js/modules/dynamic-adapt.js
/**
 * @typedef {Object} dNode
 * @property {HTMLElement} parent
 * @property {HTMLElement} element
 * @property {HTMLElement} to
 * @property {string} breakpoint
 * @property {string} order
 * @property {number} index
 */

/**
 * @typedef {Object} dMediaQuery
 * @property {string} query
 * @property {number} breakpoint
 */

/**
 * @param {'min' | 'max'} type
 */
function useDynamicAdapt(type = 'max') {
	const className = '_dynamic_adapt_'
	const attrName = 'data-da'

	/** @type {dNode[]} */
	const dNodes = getDNodes()

	/** @type {dMediaQuery[]} */
	const dMediaQueries = getDMediaQueries(dNodes)

	dMediaQueries.forEach((dMediaQuery) => {
		const matchMedia = window.matchMedia(dMediaQuery.query)
		// массив объектов с подходящим брейкпоинтом
		const filteredDNodes = dNodes.filter(({ breakpoint }) => breakpoint === dMediaQuery.breakpoint)
		const mediaHandler = getMediaHandler(matchMedia, filteredDNodes)
		matchMedia.addEventListener('change', mediaHandler)

		mediaHandler()
	})

	function getDNodes() {
		const result = []
		const elements = [...document.querySelectorAll(`[${attrName}]`)]

		elements.forEach((element) => {
			const attr = element.getAttribute(attrName)
			const [toSelector, breakpoint, order] = attr.split(',').map((val) => val.trim())

			const to = document.querySelector(toSelector)

			if (to) {
				result.push({
					parent: element.parentElement,
					element,
					to,
					breakpoint: breakpoint ?? '767',
					order: order !== undefined ? (isNumber(order) ? Number(order) : order) : 'last',
					index: -1,
				})
			}
		})

		return sortDNodes(result)
	}

	/**
	 * @param {dNode} items
	 * @returns {dMediaQuery[]}
	 */
	function getDMediaQueries(items) {
		const uniqItems = [...new Set(items.map(({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`))]

		return uniqItems.map((item) => {
			const [query, breakpoint] = item.split(',')

			return { query, breakpoint }
		})
	}

	/**
	 * @param {MediaQueryList} matchMedia
	 * @param {dNodes} items
	 */
	function getMediaHandler(matchMedia, items) {
		return function mediaHandler() {
			if (matchMedia.matches) {
				items.forEach((item) => {
					moveTo(item)
				})

				items.reverse()
			} else {
				items.forEach((item) => {
					if (item.element.classList.contains(className)) {
						moveBack(item)
					}
				})

				items.reverse()
			}
		}
	}

	/**
	 * @param {dNode} dNode
	 */
	function moveTo(dNode) {
		const { to, element, order } = dNode
		dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement)
		element.classList.add(className)

		if (order === 'last' || order >= to.children.length) {
			to.append(element)

			return
		}

		if (order === 'first') {
			to.prepend(element)

			return
		}

		to.children[order].before(element)
	}

	/**
	 * @param {dNode} dNode
	 */
	function moveBack(dNode) {
		const { parent, element, index } = dNode
		element.classList.remove(className)

		if (index >= 0 && parent.children[index]) {
			parent.children[index].before(element)
		} else {
			parent.append(element)
		}
	}

	/**
	 * @param {HTMLElement} element
	 * @param {HTMLElement} parent
	 */
	function getIndexInParent(element, parent) {
		return [...parent.children].indexOf(element)
	}

	/**
	 * Функция сортировки массива по breakpoint и order
	 * по возрастанию для type = min
	 * по убыванию для type = max
	 *
	 * @param {dNode[]} items
	 */
	function sortDNodes(items) {
		const isMin = type === 'min' ? 1 : 0

		return [...items].sort((a, b) => {
			if (a.breakpoint === b.breakpoint) {
				if (a.order === b.order) {
					return 0
				}

				if (a.order === 'first' || b.order === 'last') {
					return -1 * isMin
				}

				if (a.order === 'last' || b.order === 'first') {
					return 1 * isMin
				}

				return 0
			}

			return (a.breakpoint - b.breakpoint) * isMin
		})
	}

	function isNumber(value) {
		return !isNaN(value)
	}
}
;// CONCATENATED MODULE: ./src/js/modules/render-ordered-counters.js
/**
 * Рендерит нумерованные счетчики в элементах с классом .not-found__left-counter
 * Формат чисел: 01, 02, ..., 09, 10, 11 и т.д. (ноль убирается начиная с 10)
 */
function renderOrderedCounters() {
	const counters = document.querySelectorAll('[data-action="counter-render"]');

	counters.forEach((counter, index) => {
		const number = index + 1;
		counter.textContent = number < 10 ? `0${number}` : `${number}`;
	});
}
;// CONCATENATED MODULE: ./src/js/modules/questions-answers-accordion.js
function questionsAnswersAccordion() {
	const leftButtons = document.querySelectorAll('.questions-answers__content-left-btn');
	const contentRightItems = document.querySelectorAll('.questions-answers__content-article');

	const scrollToContent = _.debounce((targetContent) => {
		if (window.innerWidth >= 768 && targetContent) {
			targetContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, 100);

	leftButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			const targetId = btn.getAttribute('data-id');

			leftButtons.forEach((b) => b.classList.remove('active'));
			btn.classList.add('active');

			contentRightItems.forEach((content) => {
				content.setAttribute('aria-expanded', 'false');
			});

			const targetContent = document.getElementById(targetId);
			if (targetContent) {
				targetContent.setAttribute('aria-expanded', 'true');
				scrollToContent(targetContent);
			}

			updateCounter();
		});
	});

	function updateCounter() {
		const activeContent = document.querySelector('.questions-answers__content-article[aria-expanded="true"]');
		if (activeContent) {
			const counterEls = activeContent.querySelectorAll('[data-action="counter-accordion"]');
			counterEls.forEach((el, index) => {
				const count = index + 1;
				el.textContent = count < 10 ? `0${count}` : count;
			});
		}
	}

	updateCounter();

	const accordions = document.querySelectorAll('.js-accordion-answer');

	const recalcOpenAccordions = () => {
		document
			.querySelectorAll('.js-accordion-answer__item[aria-expanded="true"] .js-accordion-answer__answer')
			.forEach((answer) => {
				answer.style.maxHeight = 'auto';
				const h = answer.scrollHeight;
				answer.style.maxHeight = h + 'px';
			});
	};

	const recalcDebounced = _.debounce(recalcOpenAccordions, 100);
	window.addEventListener('resize', recalcDebounced);
	window.addEventListener('orientationchange', recalcDebounced);

	document.addEventListener('modalClose', recalcOpenAccordions);

	accordions.forEach((accordion) => {
		const items = accordion.querySelectorAll('.js-accordion-answer__item');

		items.forEach((item) => {
			const group = item.querySelector('.js-accordion-answer__group');
			const answer = item.querySelector('.js-accordion-answer__answer');

			if (item.getAttribute('aria-expanded') === 'true') {
				answer.style.maxHeight = answer.scrollHeight + 'px';
			} else {
				answer.style.maxHeight = '0px';
			}

			group.addEventListener('click', () => {
				const isExpanded = item.getAttribute('aria-expanded') === 'true';

				items.forEach((otherItem) => {
					if (otherItem !== item && otherItem.getAttribute('aria-expanded') === 'true') {
						otherItem.setAttribute('aria-expanded', 'false');
						const otherAnswer = otherItem.querySelector('.js-accordion-answer__answer');
						otherAnswer.style.maxHeight = '0px';
					}
				});

				if (isExpanded) {
					item.setAttribute('aria-expanded', 'false');
					answer.style.maxHeight = '0px';
				} else {
					item.setAttribute('aria-expanded', 'true');
					answer.style.maxHeight = 'auto';
					const h = answer.scrollHeight;
					answer.style.maxHeight = h + 'px';
				}
			});

			answer.addEventListener('transitionend', () => {
				if (item.getAttribute('aria-expanded') === 'true') {
					answer.style.maxHeight = answer.scrollHeight + 'px';
				}
			});
		});
	});
}

;// CONCATENATED MODULE: ./src/js/modules/render-ordered-steps.js
/**
 * Рендерит нумерованные счетчики в элементах, соответствующих селектору
 * Формат чисел: 01, 02, ..., 09, 10, 11 и т.д. (ноль убирается начиная с 10)
 * 
 * @param {string} selector - CSS-селектор для элементов, в которых нужно отобразить счетчики
 */
function renderOrderedSteps(selector) {
	const counters = document.querySelectorAll(selector);

	counters.forEach((counter, index) => {
		const number = index + 1;
		counter.textContent = number < 10 ? `0${number}` : `${number}`;
	});
}
;// CONCATENATED MODULE: ./src/js/modules/set-active-nav-link.js
// Функция для добавления класса активной ссылки
function setActiveNavLink() {
	// Получаем все ссылки в меню
	const navLinks = document.querySelectorAll('.nav-menu__list-items-left .nav-menu__list-item-link');
	// Получаем текущий путь (имя файла)
	const currentPath = window.location.pathname.split('/').pop();

	navLinks.forEach(link => {
		const href = link.getAttribute('href');

		if (href === currentPath) {
			link.classList.add('is-active');
		} else {
			link.classList.remove('is-active');
		}
	});
};
;// CONCATENATED MODULE: ./src/js/modules/slider-tab-content.js
function sliderTabContent() {
	function scrollButton() {
		const buttons = document.querySelectorAll(".questions-answers__content-left-item.swiper-slide");

		buttons.forEach((button, index) => {
			button.addEventListener("click", () => {
				const tabsBox = document.querySelector(".questions-answers__content-left-box.swiper");
				const tabsBoxRect = tabsBox.getBoundingClientRect();
				const buttonRect = button.getBoundingClientRect();

				const offset = buttonRect.left - tabsBoxRect.left;

				if (offset < tabsBox.clientWidth / 2) {
					scrollForward(button);
				} else {
					scrollBackward(button);
				}
			});
		});
	}

	function scrollForward(button) {
		const tabsBox = document.querySelector(".questions-answers__content-left-box.swiper");
		const tabsBoxRect = tabsBox.getBoundingClientRect();
		const buttonRect = button.getBoundingClientRect();

		const offset = buttonRect.left - tabsBoxRect.left;

		tabsBox.scrollTo({
			left: tabsBox.scrollLeft + offset - tabsBox.clientWidth / 2 + button.clientWidth / 2,
			behavior: "smooth",
		});
	}

	function scrollBackward(button) {
		const tabsBox = document.querySelector(".questions-answers__content-left-box.swiper");
		const tabsBoxRect = tabsBox.getBoundingClientRect();
		const buttonRect = button.getBoundingClientRect();

		const offset = buttonRect.right - tabsBoxRect.right;

		tabsBox.scrollTo({
			left: tabsBox.scrollLeft + offset + tabsBox.clientWidth / 2 - button.clientWidth / 2,
			behavior: "smooth",
		});
	}

	scrollButton();
}
;// CONCATENATED MODULE: ./src/js/modules/move-count-to-div-on-mobile.js
function moveCountToDivOnMobile() {
	const checkAndMoveElements = () => {
		const isMobile = window.innerWidth <= 767;
		const slides = document.querySelectorAll('.partner-block__right-carousel-slide');

		_.forEach(slides, (slide) => {
			const countEl = slide.querySelector('.partner-block__right-carousel-count');
			const divEl = slide.querySelector('.partner-block__right-carousel-div');

			if (!countEl || !divEl) return;

			if (isMobile) {
				// Для мобильных - перемещаем count в div, если еще не там
				if (!divEl.contains(countEl)) {
					divEl.appendChild(countEl);
				}
			} else {
				// Для десктопа - возвращаем count обратно в slide, если он в div
				if (divEl.contains(countEl)) {
					slide.appendChild(countEl);
				}
			}
		});
	};

	// Первый запуск
	checkAndMoveElements();

	// Слушатель изменения размера с троттлингом
	window.addEventListener('resize', _.throttle(checkAndMoveElements, 100));

	return checkAndMoveElements;
}
;// CONCATENATED MODULE: ./src/js/index.js





















// TODO.START

// TODO.END



function initLazyLoadMap() {
	const mapContainer = document.getElementById('map');
	if (!mapContainer) return;

	const observer = new IntersectionObserver((entries, obs) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				(0,geography_presence/* geographyPresence */.Aw)();
				obs.unobserve(mapContainer);
			}
		});
	}, {
		root: null,
		rootMargin: '0px',
		threshold: 0.1
	});

	observer.observe(mapContainer);
}

function handleDOMContentLoaded() {
	Global();
	useDynamicAdapt("max");
	if (document.querySelector('.running-slider')) {
		__webpack_require__.e(/* import() */ "src_js_modules_running-marquee_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/running-marquee.js")).then(({ runningMarquee }) => {
			runningMarquee();
		});
	}

	if (document.querySelector('.cookies')) {
		__webpack_require__.e(/* import() */ "src_js_modules_cookies-notification_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/cookies-notification.js")).then(({ initCookiesNotification }) => {
			initCookiesNotification();
		});
	}

	if (document.querySelector('.general-banner__content-right.swiper')) {
		__webpack_require__.e(/* import() */ "src_js_modules_general-banner_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/general-banner.js")).then(({ generalBannerSlider }) => {
			generalBannerSlider();
		});
	}

	if (document.querySelector('.new-features__right.swiper')) {
		__webpack_require__.e(/* import() */ "src_js_modules_new-features-slider_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/new-features-slider.js")).then(({ newFeaturesSlider }) => {
			newFeaturesSlider();
		});
	}

	if (document.querySelector('.our-partners__marquee-wrapper')) {
		__webpack_require__.e(/* import() */ "src_js_modules_our-partners-marquee_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/our-partners-marquee.js")).then(({ ourPartnersMarquee }) => {
			ourPartnersMarquee();
		});
	}

	if (document.querySelector('.new-features__bottom-swiper.swiper')) {
		__webpack_require__.e(/* import() */ "src_js_modules_features-card-slider_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/features-card-slider.js")).then(({ featuresCardSlider }) => {
			featuresCardSlider();
		});
	}

	if (document.querySelector('.reviews-slider__content-right.swiper')) {
		__webpack_require__.e(/* import() */ "src_js_modules_reviews-slider_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/reviews-slider.js")).then(({ reviewsSlider }) => {
			reviewsSlider();
		});
	}

	if (document.querySelector('.partner-block')) {
		Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/init-partner-carousel.js")).then(({ initPartnerCarousel }) => {
			initPartnerCarousel();
		});
	}

	if (document.querySelector('.banner-employees__carousel.swiper')) {
		__webpack_require__.e(/* import() */ "src_js_modules_banner-employees-carousel_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/banner-employees-carousel.js")).then(({ bannerEmployeesCarousel }) => {
			bannerEmployeesCarousel();
		});
	}

	if (document.querySelector('.questions-answers__content-left-box.swiper')) {
		__webpack_require__.e(/* import() */ "src_js_modules_questions-answers-slider_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/questions-answers-slider.js")).then(({ questionsAnswersSlider }) => {
			questionsAnswersSlider();
		});
	}

	if (document.querySelector('.mutual-settlements')) {
		__webpack_require__.e(/* import() */ "src_js_modules_mutual-settlements-carousel_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/mutual-settlements-carousel.js")).then(({ mutualSettlementsCarousel }) => {
			mutualSettlementsCarousel();
		});
	}

	if (document.querySelector('.employee-article__carousel.swiper')) {
		__webpack_require__.e(/* import() */ "src_js_modules_employee-slider_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/employee-slider.js")).then(({ featuresAccordionSlider }) => {
			featuresAccordionSlider();
		});
	}

	if (document.querySelector('.geography-presence__inner')) {
		__webpack_require__.e(/* import() */ "src_js_modules_shift-block-slider_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/shift-block-slider.js")).then(({ shiftBlockSlider }) => {
			shiftBlockSlider();
		});
	}

	if (document.querySelector('.questions-answers__content-right')) {
		__webpack_require__.e(/* import() */ "src_js_modules_grid-accordion-list-carry_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/grid-accordion-list-carry.js")).then(({ gridAccordionListCarry }) => {
			gridAccordionListCarry();
		});
	}

	if (document.querySelector('.js-accordion-cards')) {
		__webpack_require__.e(/* import() */ "src_js_modules_accordion-cards-toggle_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/accordion-cards-toggle.js")).then(({ accordionMarginSlider }) => {
			accordionMarginSlider();
		});
	}

	if (document.querySelector('.geography-presence__carousel.swiper')) {
		Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/geography-presence-slider.js")).then(({ geographyPresenceSlider }) => {
			geographyPresenceSlider();
		});
	}

	if (document.querySelector('.filter-aside')) {
		__webpack_require__.e(/* import() */ "src_js_modules_setup-filter-menus_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/setup-filter-menus.js")).then(({ setupFilterMenus }) => {
			setupFilterMenus();
		});
	}

	if (document.querySelector('.filter-aside')) {
		__webpack_require__.e(/* import() */ "src_js_modules_filter-modal_js").then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/filter-modal.js")).then(({ initFilterModal }) => {
			initFilterModal();
		});
	}

	if (document.querySelector('.modal')) {
		Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, "./src/js/modules/modal-slider.js")).then(({ modalSlider }) => {
			modalSlider();
		});
	}

	initLazyLoadMap();
	initMagicLineTabs('.new-features__list');
	updateFeatureInfo();
	accordionFeatures();
	initCustomSelects(() => {
		(0,geography_presence/* resetMapPlacemarks */.VF)();
	});
	initMagicLineTabsForm('.form-block__content-right-list');
	initFormTypeSwitcher('.form-block__content-right');
	initPhoneMask();
	initAutoResizeTextarea();
	enhancePartnershipForm();
	enhanceReviewBlocks();
	initModals();
	enableAjaxModalLoading();
	scrollHeader();
	enhanceModalForm('[data-modal="callback-form"]');
	enhanceModalForm('[data-modal="callback-form-employees"]');
	burgerMenuAside();
	renderOrderedCounters();
	questionsAnswersAccordion();
	renderOrderedSteps('[data-action="counter-steps"]');
	renderOrderedSteps('.mutual-settlements__count');
	setActiveNavLink();
	sliderTabContent();
	moveCountToDivOnMobile();
}

window.addEventListener('load', () => {
	const preloader = document.getElementById('preloader');
	if (preloader) {
		preloader.classList.add('loaded');

		const removeAfterTransition = () => {
			preloader.remove();
		};

		preloader.addEventListener('transitionend', removeAfterTransition, { once: true });
		preloader.addEventListener('animationend', removeAfterTransition, { once: true });
	}
});

document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);

}();
/******/ })()
;