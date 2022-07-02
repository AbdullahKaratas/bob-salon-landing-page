import React, { Component } from "react";
import { Fade, Slide } from "react-reveal";
import emailjs from '@emailjs/browser';
import toast, { Toaster } from 'react-hot-toast';


class Contact extends Component {

  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      open: false
    }
  }

  notify = () => toast('Die Email ist angekommen.');


  sendEmail = (e) => {
    this.state.open = true;
    e.preventDefault();

    emailjs.sendForm('service_rauforg', 'template_2fas96o', this.form.current, 'JF-5rSuh1c219hUzS')
      .then((result) => {
        this.notify()
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
                <button className="submit" type="submit">Senden</button>
                <Toaster
                position="bottom-center"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                  // Define default options
                  className: '',
                  duration: 5000,
                  style: {
                    background: '#3fd63a',
                    color: '#fff',
                  },
                }}
              />
              </form>

              <div id="message-warning"> Error boy</div>
              <div id="message-success">
                <i className="fa fa-check"></i>Your message was sent, thank you!
                <br />
              </div>
            </div>
          </Slide>

          <Slide right duration={1000}>
            <aside className="four columns footer-widgets">
              <div className="widget widget_contact">
                <h4>Address and Phone</h4>
                <p className="address">
                  {name}
                  <br />
                  {street} <br />
                  {city}, {state} {zip}
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
