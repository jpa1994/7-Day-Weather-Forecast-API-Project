//! Fetching
//* using this method will handle all the Asynchronus parts of async/wait/promises

//? Fetching the information link below

let currentLocation;
let currentWeather;
let searchBar = document.getElementById("searchBar");
let button = document.querySelector("#showWeather");
let forecastPlacement = document.querySelector('.revealForecast');
//button.addEventListener("click", pasteDataToPage);

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
    }


async function pasteDataToPage() {
    //? This is going to reference the Fetch function above.
    await fetchData(points);

    console.log(currentLocation);
    console.log(currentWeather);

    // To change innerText later
    let img = document.querySelector("img");
    let day = document.querySelector(".dayOfWeek");
    let fullDate = document.querySelector(".fullDate");
    let cityState = document.querySelector(".cityState");
    let temp = document.querySelector(".temp");
    let cloudsAndRain = document.querySelector(".cloudsAndRain");
    let descSmall = document.querySelector(".descSmall");

    // Weather Image
    img.src = currentWeather.properties.periods[0].icon;
    img.alt = `${currentWeather.properties.periods[0].shortForecast},${currentWeather.properties.periods[0].detailedForecast}`;

    // Day
    day.innerText = currentWeather.properties.periods[0].name;

    // Date
    let startTime = currentWeather.properties.periods[0].startTime;
    let date = new Date(startTime);
    let dayMonth = `${date.getMonth() + 1}/${date.getDate()}`;
    fullDate.innerText = dayMonth;


    // City, State
    cityState.innerText = `${currentLocation.properties.relativeLocation.properties.city}, ${currentLocation.properties.relativeLocation.properties.state}`;

    // High/Low Temps
    temp.innerText = `H: ${currentWeather.properties.periods[0].temperature}°${currentWeather.properties.periods[0].temperatureUnit}/ L: ${currentWeather.properties.periods[1].temperature}°${currentWeather.properties.periods[0].temperatureUnit}`;

    // Clouds/Rain description
    cloudsAndRain.innerText = `${currentWeather.properties.periods[0].shortForecast}`;
    descSmall.innerText = `${currentWeather.properties.periods[0].detailedForecast}`;
}
pasteDataToPage();
});

