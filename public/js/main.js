const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.dataset.hooked = 'true';
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.dataset.hooked = 'true';
    }
};

const hookTrainsCatalog = async () => {
    const listEl = document.getElementById('trains-list');
    const templateEl = document.getElementById('train-card-template');
    const loadingEl = document.getElementById('trains-loading');
    const errorEl = document.getElementById('trains-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trains');
        if (!response.ok) {
            throw new Error(`Failed to load trains (${response.status})`);
        }

        const payload = await response.json();
        const trains = payload.trains || [];
        const fragment = document.createDocumentFragment();

        trains.forEach((train) => {
            const card = templateEl.content.cloneNode(true);
            const imageEl = card.querySelector('[data-field="image"]');

            imageEl.src = train.imageUrl;
            imageEl.alt = train.imageAlt || `${train.name} train`;

            card.querySelector('[data-field="name"]').textContent = train.name;
            card.querySelector('[data-field="operator"]').textContent = train.operator;
            card.querySelector('[data-field="type"]').textContent = train.type;
            card.querySelector('[data-field="speed"]').textContent = `${train.maxSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.powerSource;
            card.querySelector('[data-field="description"]').textContent = train.description;
            card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trains right now. Please try again in a moment.';
        }
    }
};

const hookTripsCatalog = async () => {
    const tripsList = document.getElementById('trips-list');
    const template = document.querySelector('.trips-card-template');
    const searchInput = document.getElementById('trip-search');
    const regionSelect = document.getElementById('region-filter');
    const seasonSelect = document.getElementById('season-filter');
    const previousButton = document.getElementById('trips-prev');
    const nextButton = document.getElementById('trips-next');
    const pageStatus = document.getElementById('trips-page-status');
    const fragment = document.createDocumentFragment();

    if (!tripsList || !template || !searchInput || !regionSelect || !seasonSelect
        || !previousButton || !nextButton || !pageStatus) {
        return;
    }

    let currentPage = 1;
    let searchTimer;
    const loadTrips = async () => {
        const params = new URLSearchParams({
            page: String(currentPage),
            limit: '10',
            q: searchInput.value.trim(),
            region: regionSelect.value,
            season: seasonSelect.value,
            sort: 'name',
            order: 'asc'
        });
        const response = await fetch(`/api/trips?${params}`);
        if (!response.ok) {
            throw new Error(`Failed to retrieve trips from API!: ${response.status}`);
        }
        const payload = await response.json();
        const trips = payload.data || [];

        trips.forEach(trip => {
            const tripCard = template.content.cloneNode(true);
            tripCard.querySelector('.imageUrl').setAttribute('src', trip.imageUrl);
            tripCard.querySelector('.imageUrl').setAttribute('alt', trip.name);
            tripCard.querySelector('.tripName').textContent = trip.name;
            tripCard.querySelector('.trip-description').textContent = trip.description;
            tripCard.querySelector('.duration').textContent = `${trip.duration}`;
            tripCard.querySelector('.distance').textContent = `${trip.distance} km`;
            tripCard.querySelector('.bestSeason').textContent = `Best season: ${trip.bestSeason}`;
            tripCard.querySelector('.specific-trip').setAttribute('href', `/trips/${trip.id}`);

            fragment.append(tripCard);
        });

        tripsList.replaceChildren(fragment);
        pageStatus.textContent = payload.metadata.totalItems === 0
            ? 'No results'
            : `Page ${payload.metadata.currentPage} of ${payload.metadata.totalPages}`;
        previousButton.disabled = payload.metadata.currentPage <= 1;
        nextButton.disabled = payload.metadata.currentPage >= payload.metadata.totalPages;
    };

    try {
        const query = new URLSearchParams(window.location.search);
        if ([...regionSelect.options].some(option => option.value === (query.get('region') || 'all'))) {
            regionSelect.value = query.get('region') || 'all';
        }
        if ([...seasonSelect.options].some(option => option.value === (query.get('season') || 'all'))) {
            seasonSelect.value = query.get('season') || 'all';
        }
        searchInput.value = query.get('q') || '';
        await loadTrips();
        regionSelect.addEventListener('change', async () => {
            currentPage = 1;
            await loadTrips();
        });
        seasonSelect.addEventListener('change', async () => {
            currentPage = 1;
            await loadTrips();
        });
        searchInput.addEventListener('input', () => {
            window.clearTimeout(searchTimer);
            searchTimer = window.setTimeout(async () => {
                currentPage = 1;
                await loadTrips();
            }, 300);
        });
        previousButton.addEventListener('click', async () => {
            currentPage -= 1;
            await loadTrips();
        });
        nextButton.addEventListener('click', async () => {
            currentPage += 1;
            await loadTrips();
        });
    }

    catch (error) {
        console.error('Unable to retrieve trips api!', error);
    }
}

const stationDetailsCache = new Map();

const renderStationDetails = (container, station) => {
    const details = document.createElement('dl');
    const fields = [
        ['Prefecture', station.prefecture],
        ['Region', station.region],
        ['Description', station.description],
        ['Facilities', Array.isArray(station.facilities) ? station.facilities.join(', ') : '']
    ];

    fields.forEach(([label, value]) => {
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        term.textContent = label;
        description.textContent = value || 'Not available';
        details.append(term, description);
    });

    container.replaceChildren(details);
};

const hookStationDetails = () => {
    document.querySelectorAll('.station-details-toggle').forEach((button) => {
        button.addEventListener('click', async () => {
            const container = document.getElementById(button.getAttribute('aria-controls'));
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            button.setAttribute('aria-expanded', String(!isExpanded));
            container.hidden = isExpanded;

            if (isExpanded || container.dataset.loaded === 'true') {
                return;
            }

            const stationId = button.dataset.stationId;
            container.textContent = 'Loading station details...';

            try {
                let station = stationDetailsCache.get(stationId);
                if (!station) {
                    const response = await fetch(`/api/stations/${encodeURIComponent(stationId)}`);
                    if (!response.ok) {
                        throw new Error(`Station request failed with status ${response.status}`);
                    }

                    station = await response.json();
                    stationDetailsCache.set(stationId, station);
                }

                renderStationDetails(container, station);
                container.dataset.loaded = 'true';
            } catch (error) {
                console.error('Unable to retrieve station details:', error);
                container.textContent = 'Unable to load station details. Please try again.';
            }
        });
    });
};

const hookBookingsCatalog = async () => {
    const listEl = document.getElementById('bookings-list');
    const templateEl = document.getElementById('booking-card-template');
    const loadingEl = document.getElementById('bookings-loading');
    const emptyEl = document.getElementById('bookings-empty');
    const errorEl = document.getElementById('bookings-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/bookings');
        if (!response.ok) {
            throw new Error(`Failed to load bookings (${response.status})`);
        }

        const bookings = await response.json();
        if (!Array.isArray(bookings)) {
            throw new Error('The bookings response was not a list.');
        }

        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (bookings.length === 0) {
            if (emptyEl) {
                emptyEl.hidden = false;
            }
            return;
        }

        const fragment = document.createDocumentFragment();
        bookings.forEach((booking) => {
            const card = templateEl.content.cloneNode(true);
            card.querySelector('[data-field="link"]').href =
                `/bookings/${encodeURIComponent(booking.id)}`;
            card.querySelector('[data-field="id"]').textContent = booking.id;
            card.querySelector('[data-field="trip"]').textContent = booking.tripId;
            card.querySelector('[data-field="schedule"]').textContent = booking.scheduleId;
            card.querySelector('[data-field="ticket"]').textContent = booking.ticketClass;
            card.querySelector('[data-field="day"]').textContent = booking.selectedDay;
            card.querySelector('[data-field="created"]').textContent = booking.createdAt
                ? new Date(booking.createdAt).toLocaleString()
                : 'Unknown';

            const passengersEl = card.querySelector('[data-field="passengers"]');
            (booking.passengers || []).forEach((passenger) => {
                const item = document.createElement('li');
                item.textContent = `${passenger.firstName} ${passenger.lastName} - ${passenger.email} - ${passenger.phone}`;
                passengersEl.appendChild(item);
            });

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load bookings right now. Please try again in a moment.';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    hookRegionSorter();
    hookSeasonSorter();
    hookTrainsCatalog();
    hookTripsCatalog();
    hookStationDetails();
    hookBookingsCatalog();
});