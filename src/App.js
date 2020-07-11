import React from 'react';
import './App.css';

const API_KEY = 'c190e449b5a43f92dfde84d23340062f';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            city: "",
            latitude: 0,
            longitude: 0,
            temp: 0,
            feelsLike: 0,
            min: 0,
            max: 0,
            info: {current: {dt: 0, weather: [{icon: "01d", description: ""}]}}
        };

        this.apiCall = this.apiCall.bind(this);
        this.getTimeInTimeZone = this.getTimeInTimeZone.bind(this);
    }

    componentDidMount() {
        let self = this;
        navigator.geolocation.getCurrentPosition(function(position) {
            self.setState({latitude: position.coords.latitude, longitude: position.coords.longitude});
            self.apiCall();
            fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&lang=de&limit=10&apiKey=175c2c2a847f4edab0c6621c4560f444`)
                .then(
                    function (response) {
                        response.json().then(function (data) {
                            self.setState({city: data.features[0].properties.state});
                        })
                    }
                )
                .catch(function(err) {
                    console.log('Fetch Error :-S', err);
                });
        });
    }

    getTimeInTimeZone(dt) {
        let convertedDate = new Date(dt * 1000).toLocaleString("en-US", {timeZone: this.state.info.timezone});
        let newDate = new Date(convertedDate);
        let hours = newDate.getHours() > 12 ? newDate.getHours() - 12 : newDate.getHours();
        let amORpm = newDate.getHours() > 12 ? "PM" : "AM";
        let timeFromDate = hours + ":" + ("0" + newDate.getMinutes()).substr(-2) + " " + amORpm;
        return (timeFromDate);
    }

    apiCall() {
        let self = this;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${this.state.latitude}&lon=${this.state.longitude}&units=metric&appid=${API_KEY}`)
            .then(
                function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }
                    response.json().then(function(data) {
                        //let localTime = new Date(data.daily[0].dt * 1000).toLocaleString("en-US", {timeZone: data.timezone});
                        self.setState({temp: Math.round(data.current.temp), feelsLike: Math.round(data.current.feels_like), min: Math.round(data.daily[0].temp.min), max: Math.round(data.daily[0].temp.max), info: data});
                    });
                }
            )
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
    }

    render() {
        return (
            <div className="App">
                <span className={"title"}>the weather</span>
                <header className="Container">
                    <span className={"time"}>{this.getTimeInTimeZone(this.state.info.current.dt)}</span>
                    <div className={"info"}>
                        {this.state.city}
                        <div>
                            <img className={"icon"} src={`http://openweathermap.org/img/wn/${this.state.info.current.weather[0].icon}@4x.png`} alt={""}/>
                            <span className={"temp"}>{this.state.temp}°C</span>
                        </div>
                        {this.state.info.current.weather[0].description}
                    </div>
                    <span className={"min-text"}>min</span><span className={"min"}>{this.state.min}°C</span>
                    <span className={"max-text"}>max</span><span className={"max"}>{this.state.max}°C</span>
                </header>
            </div>
        );
    }
}

export default App;
