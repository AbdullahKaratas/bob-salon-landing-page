import React, { Component } from "react";
import { Fade } from "react-reveal";
import emailjs from "@emailjs/browser";
import { withStyles } from "@mui/styles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

const styles = (theme) => ({
  rootInfo: {
    width: "20px",
    marginRight: "20px",
  },
});

class Reservation extends Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      open: false,
      loading: 2,
      openDialog: false,
    };
  }

  sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  sendEmail = (e) => {
    this.setState({
      loading: 0,
    });
    this.setState({
      open: true,
    });
    e.preventDefault();

    emailjs
      .sendForm(
        "service_rauforg",
        "template_2fas96o",
        this.form.current,
        "JF-5rSuh1c219hUzS"
      )
      .then(
        (result) => {
          this.setState({
            loading: 1,
          });
          this.sleep(2000).then((r) => {
            this.setState({
              loading: 2,
            });
          });
          // <Snackbar open={this.state.open} autoHideDuration={6000} message="Email gesendet" />
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  handleClick = () => {
    this.setState({
      open: true,
    });
  };

  handleDialogOpen = () => {
    this.setState({
      openDialog: true,
    });
  };

  handleDialogClose = () => {
    this.setState({
      openDialog: false,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  handleClickLoading = () => {
    this.setState({
      loading: !this.state.loading,
    });
  };

  render() {
    if (!this.props.data) return null;
    return (
      <section id="reservation">
        <Fade bottom duration={1000}>
        <div className="row">
                <div >
                  <h2>Starte deine Reservierung</h2>
                  <p className="address">
                    <span>Klicke auf den Button um die Reservierung zu beginnen</span>
                    <br />
                  </p>
                </div>
              </div>
        </Fade>
        <div className="row">
          <button
            className="submit"
            type="button"
            onClick={this.handleDialogOpen}
          >
            Öffne Reservierung
          </button>
          <Dialog
            open={this.state.openDialog}
            onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
            maxWidth={"lg"}
          >
            <DialogContent>
              <iframe
                id="etifr"
                title="Reservierung"
                src="https://BOB.as.me/"
                height="1600px"
                width="100%"
                scrolling="no"
                frameborder="0"
              ></iframe>
            </DialogContent>
            <DialogActions>
              <button onClick={this.handleDialogClose}>Abbrechen</button>
            </DialogActions>
          </Dialog>
        </div>
      </section>
    );
  }
}

export default withStyles(styles)(Reservation);
