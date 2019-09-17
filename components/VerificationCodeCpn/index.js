import React, {Component} from 'react';

class VerificationCodeCpn extends Component {
    state = {
        surplusTime: 60,
    };

    componentDidMount() {
        this.setState({
            surplusTime: +this.props.time
        });
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            const {surplusTime} = this.state;
            if (surplusTime < 1) {
                this.setState({
                    surplusTime: 60
                });
                clearInterval(this.timer);
                return;
            }
            this.setState({
                surplusTime: this.state.surplusTime - 1
            })
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const {surplusTime} = this.state;
        // console.log(surplusTime);
        return (
            <span>剩余 {surplusTime}(s)</span>
        );
    }
}

export default VerificationCodeCpn;