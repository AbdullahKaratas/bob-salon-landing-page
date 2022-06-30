import React, { Component } from "react";
import { Fade, Slide } from "react-reveal";
// import { send } from 'emailjs-com';
import emailjs from '@emailjs/browser';

class Contact extends Component {

  constructor(props) {
    super(props);
    this.form = React.createRef();
  }

  sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_rauforg', 'template_2fas96o', this.form.current, 'JF-5rSuh1c219hUzS')
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });
  };

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     toSend: [{
  //       from_name: '',
  //       to_name: '',
  //       message: '',
  //       reply_to: '',
  //     }]
  //   };  
  // }
  
  // onSubmit = (e) => {
  //   e.preventDefault();
  //   send(
  //     'service_rauforg',
  //     'template_2fas96o',
  //     'JF-5rSuh1c219hUzS'
  //   ).then((response) => {
  //       console.log('SUCCESS!', response.status, response.text);
  //     }).catch((err) => {
  //       console.log('FAILED...', err);
  //     });
  //   };

  // handleChange = (e) => {
  //   this.setState({ 
  //     ...this.state.toSend, 
  //     [e.target.name]: 
  //     e.target.value 
  //   });
  // };

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
              {/* <form onSubmit={this.onSubmit} id="contactForm" name="contactForm">
                <fieldset>
                  <div>
                    <label htmlFor="contactName">
                      Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      size="35"
                      id="contactName"
                      name='from_name'
                      value={this.state.toSend.from_name}
                      onChange={this.handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactTo">
                      An <span className="required">*</span>
                    </label>
                    <input
                      type='text'
                      defaultValue=""
                      size="35"
                      id="contactTo"
                      name='to_name'
                      value={this.state.toSend.to_name}
                      onChange={this.handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name='reply_to'
                      defaultValue=""
                      size="35"
                      value={this.state.toSend.reply_to}
                      id="contactEmail"
                      onChange={this.handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="contactSubject">Betreff</label>
                    <input
                      type="text"
                      defaultValue=""
                      size="35"
                      id="contactSubject"
                      name="contactSubject"
                      onChange={this.handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="contactMessage">
                      Message <span className="required">*</span>
                    </label>
                    <textarea
                      cols="50"
                      rows="15"
                      id="contactMessage"
                      type='text'
                      name='message'
                      value={this.state.toSend.message}
                      onChange={this.handleChange}
                    ></textarea>
                  </div>
                  <div>
                    <button className="submit">Submit</button>
                    <span id="image-loader">
                      <img alt="" src="images/loader.gif" />
                    </span>
                  </div>
                </fieldset>
              </form> */}
              <form ref={this.form} onSubmit={this.sendEmail}>
                <label>Name</label>
                  <input type="text" name="from_name" />
                <label>Email</label>
                  <input type="email" name="from_email" />
                <label>Message</label>
                  <textarea name="message" />
                <input type="submit" value="Send" />
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
