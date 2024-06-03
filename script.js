$(function() {
    const fetchCountries = async () => {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        return data.map(country => country.name.common);
    };

    const fetchUniversities = async country => {
        $('#spinner').removeClass('hidden');
        const response = await fetch(`https://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`);
        const data = await response.json();
        $('#spinner').addClass('hidden');
        return data;
    };

    const renderUniversities = universities => {
        const output = universities.map(university => `
            <div class="university-item bg-white p-4 rounded shadow mb-4" data-name="${university.name.toLowerCase()}">
                <h3 class="text-xl font-semibold text-blue-600">${university.name}</h3>
                <p class="text-gray-700">Country: ${university.country}</p>
                <p class="text-gray-700">Website: <a href="${university.web_pages[0]}" target="_blank" class="text-blue-500 hover:underline">${university.web_pages[0]}</a></p>
                <button class="favorite-btn bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-700" data-university='${JSON.stringify(university)}'>Add to Favorites</button>
            </div>
        `).join('');
        $('#output').html(output);
    };

    const filterUniversities = searchTerm => {
        $('.university-item').each(function() {
            const universityName = $(this).data('name');
            $(this).toggle(universityName.includes(searchTerm));
        });
    };

    const saveFavorite = university => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (!favorites.some(fav => fav.name === university.name)) {
            favorites.push(university);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    };

    const loadFavorites = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const output = favorites.length ? favorites.map(university => `
            <div class="bg-white p-4 rounded shadow mb-4">
                <h3 class="text-xl font-semibold text-blue-600">${university.name}</h3>
                <p class="text-gray-700">Country: ${university.country}</p>
                <p class="text-gray-700">Website: <a href="${university.web_pages[0]}" target="_blank" class="text-blue-500 hover:underline">${university.web_pages[0]}</a></p>
            </div>
        `).join('') : '<p class="text-red-500">No favorites saved.</p>';
        $('#favoritesList').html(output);
        $('#favoritesModal').removeClass('hidden');
    };

    const initialize = async () => {
        const countries = await fetchCountries();
        $('#country').autocomplete({ source: countries });

        $('#searchButton').click(async () => {
            const country = $('#country').val();
            if (!country) {
                $('#output').html('<p class="text-red-500">Please enter a country.</p>');
                return;
            }
            const universities = await fetchUniversities(country);
            if (universities.length === 0) {
                $('#output').html('<p class="text-red-500">No universities found for the selected country.</p>');
                return;
            }
            $('#universitySearchContainer').removeClass('hidden');
            renderUniversities(universities);
        });

        $('#country').keypress(async event => {
            if (event.key === "Enter") {
                event.preventDefault();
                $('#searchButton').click();
            }
        });

        $('#universitySearch').on('input', function() {
            const searchTerm = $(this).val().toLowerCase();
            filterUniversities(searchTerm);
        });

        $(document).on('click', '.favorite-btn', function() {
            const university = $(this).data('university');
            saveFavorite(university);
            alert('Saved to favorites!');
        });

        $('#viewFavoritesButton').click(loadFavorites);
        $('#closeFavoritesModal').click(() => $('#favoritesModal').addClass('hidden'));
        $('#closeModal').click(() => $('#universityModal').addClass('hidden'));
    };

    initialize();
});
