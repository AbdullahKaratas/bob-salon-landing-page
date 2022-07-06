import React, { Component } from "react";
import { Fade, Slide } from "react-reveal";
import emailjs from '@emailjs/browser';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';


class Contact extends Component {

  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      open: false,
      loading: 2
    }
  }

  sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

  sendEmail = (e) => {
    this.setState({
      loading: 0
    })
    this.state.open = true;
    e.preventDefault();

    emailjs.sendForm('service_rauforg', 'template_2fas96o', this.form.current, 'JF-5rSuh1c219hUzS')
      .then((result) => {
        this.setState({
          loading: 1
        })
        this.sleep(2000).then(r => {
          this.setState({
            loading: 2
          })
        })
        // <Snackbar open={this.state.open} autoHideDuration={6000} message="Email gesendet" />
      }, (error) => {
          console.log(error.text);
      });
  };

  handleClick = () => {
    this.state.open = true;
  };

  handleClose = () => {
    this.state.open = false;
  };

  handleClickLoading = () => {
    this.setState({
      loading: !this.state.loading
    })
  };
  
  render() {
    if (!this.props.data) return null;

    const name = this.props.data.name.toLowerCase();
    const street = this.props.data.address.street.toLowerCase();
    const city = this.props.data.address.city.toLowerCase();
    const state = this.props.data.address.state.toLowerCase();
    const zip = this.props.data.address.zip.toLowerCase();
    const phone = this.props.data.phone.toLowerCase();
    const message = this.props.data.contactmessage.toLowerCase();

    return (
      <section id="contact">
        <Fade bottom duration={1000}>
          <div className="row section-head">
            <div className="two columns header-col">
              <h1>
                <span>Get In Touch.</span>
              </h1>
            </div>

            <div className="ten columns">
              <p className="lead">{message}</p>
            </div>
          </div>
        </Fade>
        <div className="row">
          <Slide left duration={1000}>
            <div className="eight columns">
              <form ref={this.form} onSubmit={this.sendEmail}>
                <label>name</label>
                  <input type="text" name="from_name" />
                <label>email</label>
                  <input type="email" name="from_email" />
                <label>nachricht</label>
                  <textarea name="message" />
                    {
                        this.state.loading == 0 ? 
                        <div style={{marginLeft: '27%'}}>
                          <CircularProgress/> 
                        </div> 
                        : this.state.loading == 1 ?
                        <div style={{marginLeft: '27%'}}>
                          <Alert variant="filled" severity="success" style={{background: '#c4f7d0', color: '#000000'}}>
                            <AlertTitle style={{fontSize: '15px'}}>Nachricht gesendet</AlertTitle>
                          </Alert>
                        </div> 
                        :
                        <div>
                          <button className="submit" type="submit">
                            Senden
                          </button>
                          <button
                              className="submit"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href='https://www.picktime.com/6769b287-58e1-44c6-92ae-db361d12bc21';
                                }}
                          >Reservierung bei bob-salon</button>
                          {/* <a href="https://www.picktime.com/6769b287-58e1-44c6-92ae-db361d12bc21" 
                            style={{float: 'none' }}>
                            <img border="none" 
                              src="https://www.picktime.com/img/widgetButtons/BookingPage/picktime-book-online-gray.png" 
                              alt="Reservierung bei bob-salon"/>
                          </a> */}
                        </div> 
                        
                    }
              </form>
            </div>
          </Slide>
        </div>
      </section>
    );
  }
}

export default Contact;
