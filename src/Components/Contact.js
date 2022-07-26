import React, { Component } from "react";
import { Fade, Slide } from "react-reveal";
import emailjs from '@emailjs/browser';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { withStyles } from '@mui/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';


const styles = theme => ({
  rootInfo: {
    width: '20px',
    marginRight: '20px'
  },
});

class Contact extends Component {

  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      open: false,
      loading: 2,
      openDialog: false
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

  handleDialogOpen = () => {
    this.setState({
      openDialog: true
    })
  };

  handleDialogClose = () => {
    this.setState({
      openDialog: false
    })
  }

  handleClose = () => {
    this.state.open = false;
  };

  handleClickLoading = () => {
    this.setState({
      loading: !this.state.loading
    })
  };
  
  render() {
    const { classes } = this.props;

    if (!this.props.data) return null;
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
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  name="from_name"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& > fieldset": {
                        border: "none"
                      }
                    }
                  }}
                  className={classes.rootInfo}
                />
                <label>email</label>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  name="from_email"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& > fieldset": {
                        border: "none"
                      }
                    }
                  }}
                />
                <label>nachricht</label>
                  <TextField
                  margin="normal"
                  required
                  id="message"
                  name="message"
                  multiline
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& > fieldset": {
                        border: "none"
                      }
                    }
                  }}
                  // style={{width: '400px'}}
                  />
                    {
                        this.state.loading === 0 ? 
                        <div style={{marginLeft: '27%'}}>
                          <CircularProgress/> 
                        </div> 
                        : this.state.loading === 1 ?
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
                          >In Page</button>
                          <button
                              className="submit"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open('https://www.eTermin.net/abdullahkaratas', '_blank', 'noopener,noreferrer');
                                }}
                          >Neuer Tab</button>
                          <button
                              className="submit"
                              type="button"
                              onClick={this.handleDialogOpen}
                          >Als Dialog</button>
                          <Dialog
                            open={this.state.openDialog}
                            onClose={this.handleClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                            fullWidth
                            maxWidth={'lg'}
                          >
                            <DialogContent>
                            <iframe id="etifr" src="https://www.eTermin.net/abdullahkaratas" height="1600px" width="100%" scrolling="no" frameborder="0"></iframe><script id="etwidget" src="https://www.etermin.net/js/etwidget.min.js" data-text="Termin%20buchen" data-color="#F45917" data-colortext="#FFFFFF" data-pos="right" data-size="n"></script>
                            </DialogContent>
                            <DialogActions>
                              <button onClick={this.handleDialogClose}>
                                Abbrechen
                              </button>
                            </DialogActions>
                          </Dialog>
                          {/* <button
                              className="submit"
                              type="button"
                              onClick={this.handleDialogOpen}
                          >Reservierung bei bob-salon</button> */}
                          {/* <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            open={this.state.openDialog}
                            onClose={this.handleClose}
                            closeAfterTransition
                            BackdropComponent={Backdrop}
                            BackdropProps={{
                              timeout: 500,
                            }}
                          >
                            <Fade in={this.state.openDialog}>
                              <Box>
                              <iframe id="etifr" src="https://www.eTermin.net/abdullahkaratas" height="1600px" width="100%" scrolling="no" frameborder="0"></iframe><script id="etwidget" src="https://www.etermin.net/js/etwidget.min.js" data-text="Termin%20buchen" data-color="#F45917" data-colortext="#FFFFFF" data-pos="right" data-size="n"></script>
                              </Box>
                            </Fade>
                          </Modal> */}
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

export default withStyles(styles)(Contact);
