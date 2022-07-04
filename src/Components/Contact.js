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

    const name = this.props.data.name;
    const street = this.props.data.address.street;
    const city = this.props.data.address.city;
    const state = this.props.data.address.state;
    const zip = this.props.data.address.zip;
    const phone = this.props.data.phone;
    const message = this.props.data.contactmessage;

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
                <label>Name</label>
                  <input type="text" name="from_name" />
                <label>Email</label>
                  <input type="email" name="from_email" />
                <label>Message</label>
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
                        <button className="submit" type="submit">
                          Senden
                        </button>
                    }
              </form>
            </div>
          </Slide>

          <Slide right duration={1000}>
            <aside className="four columns footer-widgets">
              <div className="widget widget_contact">
                <h4>Anschrift und Telefon</h4>
                <p className="address">
                  {name}
                  <br />
                  {street} <br />
                  {zip} {city}, {state} 
                  <br />
                  <span>{phone}</span>
                </p>
              </div>
            </aside>
          </Slide>
        </div>
      </section>
    );
  }
}

export default Contact;
