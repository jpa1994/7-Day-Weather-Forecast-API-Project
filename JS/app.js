//! Fetching
//* using this method will handle all the Asynchronus parts of async/wait/promises

//? Fetching the information link below


let currentLocation;
let currentWeather;
let searchBar = document.getElementById("searchBar");
let button = document.querySelector("#showWeather");
let forecastPlacement = document.querySelector('.revealForecast');

// Convert userInput from search bar to array and numbers
searchBar.addEventListener("submit",(e) => {
    e.preventDefault(); // Stops page from refreshing
    
    // Grab userInput
    let userInput = document.getElementById("userInput").value.trim();

    // Turns string userInput into an array (splits at ,) and converts each string in an array into numbers (.map(Number))
    let [y1,x1] = userInput.split(",").map(Number); 

    if(isNaN(y1) || isNaN(x1)) {
        alert("Enter valid coordinates (Ex. 30.123,-89.123)");
        return;
    }

    let points = [y1,x1];

    console.log(points);
    fetchData(points);


    // Fetch API data
    async function fetchData(points) {
        let urlLocation = `https://api.weather.gov/points/${points}`;
        console.log(urlLocation);


        // https://api.weather.gov/points/${points}
        await fetch(urlLocation)
            .then(res => res.json())
            .then(data => {

                //? Console log test
                console.log(data.properties.relativeLocation.properties.city);
                console.log(data.properties.relativeLocation.properties.state);
                console.log(data.properties.gridId);
                console.log(data.properties.gridX);
                console.log(data.properties.gridY);
                
                currentLocation = data;

                
                
            })
            .catch(error => {
                console.log(error);
            })


        // Call neccesarry data to put in urlGrid    
        let wfo = currentLocation.properties.gridId;
        let x = currentLocation.properties.gridX;
        let y = currentLocation.properties.gridY;
        let urlGrid = `https://api.weather.gov/gridpoints/${wfo}/${x},${y}/forecast`;
        console.log(wfo);
        console.log(urlGrid);

        // https://api.weather.gov/gridpoints/${wfo}/${x},${y}/forecast
        await fetch(urlGrid)
            .then(res => res.json())
            .then(data => {

                //? Console log test
                console.log(data.properties.periods[0].windSpeed, data.properties.periods[0].windDirection);
                
                currentWeather = data;
                
            })
            .catch(error => {
                console.log(error);
            })
            pasteDataToPage();
    }


    async function pasteDataToPage() {
        /////? This is going to reference the Fetch function above.
        //await fetchData(points);

        console.log(currentLocation);
        console.log(currentWeather);

        // Grab card container and fullcard
        let forecastContainer = document.querySelector(".card-container");
        forecastContainer.classList.add("ms-5", "me-5")

        // Clone og card and replace with newContainer cards
        let newContainer = forecastContainer.cloneNode(true);
        forecastContainer.parentNode.replaceChild(newContainer, forecastContainer);

        // Re-assign forecastContainer with newContainer data
        forecastContainer = newContainer;


        //let img = document.querySelector("img");
        //let day = document.querySelector(".dayOfWeek");
        //let fullDate = document.querySelector(".fullDate");
        //let temp = document.querySelector(".temp");
        //let cloudsAndRain = document.querySelector(".cloudsAndRain");
        //let accButton = document.querySelector(".accButton");
        //let descSmall = document.querySelector(".descSmall");

        // City and State
        let city = currentLocation.properties.relativeLocation.properties.city;
        let state = currentLocation.properties.relativeLocation.properties.state;
        let cityState = document.querySelector(".cityState");
        cityState.innerText = `${city},${state}`;

        // Only use daytime and current time weather (first 7 days including today)
        ////let daytimePeriods = periods.filter(p => p.isDaytime).slice(0, 7);
        let periods = currentWeather.properties.periods;
        let firstPeriod = periods[0];
        let daytimePeriods = [];

        // Dispalys "Tonight" from first period if it's not daytime
        if (!firstPeriod.isDaytime) {
            daytimePeriods.push(firstPeriod);
            daytimePeriods.push(...periods.filter(p => p.isDaytime).slice(0, 6));

            //* If not "Tonight", then first period must be daytime
        } else {
            daytimePeriods = periods.filter(p => p.isDaytime).slice(0, 7);
        }

        // Clear old cards
        while (forecastContainer.firstChild) {
            forecastContainer.removeChild(forecastContainer.firstChild);
        }

        // Make new cards with appropriate API info
        daytimePeriods.forEach((period, i) => {

            // Clone card template and it's child nodes. Assign clone to fullCard.
            let template = document.getElementById("cardTemplate");
            let card = template.content.cloneNode(true).children[0];
            forecastContainer.appendChild(card);


            // Image
            card.querySelector("img").src = period.icon;
            card.querySelector("img").alt = period.shortForecast;

            // Day of week and full date
            card.querySelector(".dayOfWeek").innerText = period.name;
            let date = new Date(period.startTime);
            card.querySelector(".fullDate").innerText = `${date.getMonth() + 1}/${date.getDate()}`;

            // Hight and Low temps
            let fullIndex = periods.findIndex(p => p.name == period.name);
            let low = periods[fullIndex + 1]?.temperature ?? "N/A";
            let unit = period.temperatureUnit;
            card.querySelector(".temp").innerText = `H: ${period.temperature}°${unit} / L: ${low}°${unit}`;

            // Clouds and rain
            card.querySelector(".cloudsAndRain").innerText = period.shortForecast;
            card.querySelector(".descSmall").innerText = period.detailedForecast;

            // Accordion
            let accId = `accordion${i}`;
            let collapseId = `collapse${i}`;

            let accordion = card.querySelector(".accordion");
            let accButton = card.querySelector(".accButton");
            let collapseDiv = card.querySelector(".accordion-collapse");

            accordion.id = accId;
            collapseDiv.id = collapseId;

            collapseDiv.setAttribute("data-bs-parent", `#${accId}`);
            accButton.setAttribute("data-bs-target", `#${collapseId}`);
            accButton.setAttribute("aria-controls", collapseId);

            forecastContainer.appendChild(card);
        })
    }

})

