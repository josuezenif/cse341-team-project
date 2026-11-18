const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const url = new URL(window.location.href);

            if (selectedRegion && selectedRegion !== 'all') {
                url.searchParams.set('region', selectedRegion);
            } else {
                url.searchParams.delete('region');
            }

            window.location.href = url.toString();
        });
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', () => {
            const selectedSeason = seasonSelect.value;
            const url = new URL(window.location.href);

            if (selectedSeason && selectedSeason !== 'all') {
                url.searchParams.set('season', selectedSeason);
            } else {
                url.searchParams.delete('season');
            }

            window.location.href = url.toString();
        });
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
            card.querySelector('[data-field="speed"]').textContent = `${train.topSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.power;
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
    const fragment = document.createDocumentFragment();

    if (!tripsList || !template) {
        return;
    }

    try {
        const response = await fetch('/api/trips');
        if (!response.ok) {
            throw new Error(`Failed to retrieve trips from API!: ${response.status}`);
        }
        const trips = await response.json();

        trips.forEach(trip => {
            const tripCard = template.content.cloneNode(true);
            tripCard.querySelector('.imageUrl').setAttribute('src', trip.imageUrl);
            tripCard.querySelector('.imageUrl').setAttribute('alt', trip.description);
            tripCard.querySelector('.tripName').textContent = trip.name;
            tripCard.querySelector('.trip-description').textContent = trip.description;
            tripCard.querySelector('.duration').textContent = `${trip.durationHours} hours`;
            tripCard.querySelector('.distance').textContent = `${trip.distanceKm} km`;
            tripCard.querySelector('.bestSeason').textContent = `Best season: ${trip.bestSeason}`;
            tripCard.querySelector('.specific-trip').setAttribute('href', `/trips?id=${trip.id}`);

            fragment.append(tripCard);
        });

        tripsList.replaceChildren(fragment);
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

document.addEventListener('DOMContentLoaded', () => {
    hookRegionSorter();
    hookSeasonSorter();
    hookTrainsCatalog();
    hookTripsCatalog();
    hookStationDetails();
});