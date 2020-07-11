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
            info: {daily:[{dt: 0, temp: {day: 0, min: 0, max: 0}, weather: [{icon: "01d", description: ""}]}]},
            day: "",
            dayPos: 0
        };

        this.apiCall = this.apiCall.bind(this);
        this.getDayInTimezone = this.getDayInTimezone.bind(this);
        this.changeDay = this.changeDay.bind(this);
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

    getDayInTimezone(dt) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let convertedDate = new Date(dt * 1000).toLocaleString("en-US", {timeZone: this.state.info.timezone});
        let newDate = new Date(convertedDate);
        return (days[newDate.getDay()]);
    }

    changeDay(amount) {
        this.setState({dayPos: this.state.dayPos + amount});
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
                        console.log(data);
                        self.setState({info: data});
                    });
                }
            )
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
    }

    render() {
        let prevButton = <button className={"ChangeDayButton prev"} onClick={() => this.changeDay(-1)}>prev</button>
        let nextButton = <button className={"ChangeDayButton next"} onClick={() => this.changeDay(1)}>next</button>

        if (this.state.dayPos === 0) {
            prevButton = null;
        } else if (this.state.dayPos === 6) {
            nextButton = null;
        }

        return (
            <div className="App">
                <span className={"title"}>the weather</span>
                <div className="Container">
                    <span className={"time"}>{this.getDayInTimezone(this.state.info.daily[this.state.dayPos].dt)}</span>
                    <div className={"info"}>
                        {this.state.city}
                        <div>
                            <img className={"icon"} src={`http://openweathermap.org/img/wn/${this.state.info.daily[this.state.dayPos].weather[0].icon}@4x.png`} alt={""}/>
                            <span className={"temp"}>{Math.round(this.state.info.daily[this.state.dayPos].temp.day)}°C</span>
                        </div>
                        {this.state.info.daily[this.state.dayPos].weather[0].description}
                    </div>
                    <span className={"min-text"}>min</span><span className={"min"}>{Math.round(this.state.info.daily[this.state.dayPos].temp.min)}°C</span>
                    <span className={"max-text"}>max</span><span className={"max"}>{Math.round(this.state.info.daily[this.state.dayPos].temp.max)}°C</span>
                </div>
                {prevButton}
                {nextButton}
            </div>
        );
    }
}

export default App;
