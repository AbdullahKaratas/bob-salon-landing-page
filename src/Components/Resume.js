import React, { Component } from "react";
import Fade from "react-reveal";

class Resume extends Component {
  render() {
    if (!this.props.data) return null;

    const sections = this.props.data.sections || [];
    const footnote = this.props.data.footnote;

    return (
      <section id="resume">
        {sections.map((section, sectionIndex) => (
          <Fade duration={600} delay={sectionIndex * 100} key={section.id}>
            <div
              className={
                "row price-block" +
                (sectionIndex === sections.length - 1 ? " price-block-last" : "")
              }
            >
              <div className="three columns header-col">
                <h1>
                  <span>{section.title}</span>
                </h1>
              </div>

              <div className="nine columns main-col">
                {section.groups.map((group, groupIndex) => (
                  <div className="price-group" key={group.subtitle || groupIndex}>
                    {group.subtitle && (
                      <h3 className="price-group-title">{group.subtitle}</h3>
                    )}

                    <ul className="price-list">
                      {group.items.map((item) => (
                        <li className="price-item" key={item.leistung}>
                          <span className="price-item-name">{item.leistung}</span>
                          <span className="price-item-dots" aria-hidden="true"></span>
                          <span className="price-item-price">{item.preis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {section.note && <p className="price-note">{section.note}</p>}
              </div>
            </div>
          </Fade>
        ))}

        {footnote && (
          <Fade duration={600} delay={sections.length * 100}>
            <div className="row">
              <div className="twelve columns">
                <p className="price-footnote">{footnote}</p>
              </div>
            </div>
          </Fade>
        )}
      </section>
    );
  }
}

export default Resume;
