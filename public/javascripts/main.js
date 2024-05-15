/*
PEDAC

create contacts class:
  - constructor function
    - create contacts object (IIFE)
    - retrieve current contacts
      - if there are no current contacts
        - display the 'homepage-no-contacts' div
    - add an event listener to the 'add-contact' div's

  current contacts:
    - each contact should have an edit and delete button
    - edit button:
      - add an event listener, click
        - pull up edit contact page
          - all of the information should be pre-filled with the current information
          - the 'cancel' button should go back to homepage
          - the 'submit' button should update the changes and go back to the homepage

    - delete button:
      - add an event listener, click
        - create an alert asking if we want the contact to be deleted
          - if clicked, use the 'deleteContact' method to delete the contact.

  add contacts buttons:
    - prevent default action
    - display the create-contact div
    - create a tag div
    - add an event listener to the form 'submit'
      - use the 'addContact' method to add a new contact

storing contacts:
  - use IIFE
    - create an object to the variable contacts
    - create 'addContact' method
      - make sure the 'full name' section gets trimmed of whitespace.  
        - if the trimmed input is an empty string
          - throw 'need valid name' error
        - else 
          - set as the contacts key
      - make sure the email address has a valid email.  must include the '@' and something afterwards ending with '.com'
        - if the email address is invalid
          - throw 'need valid email' error
        - else set key as 'email' and value as the input email
      - make sure the phone number consists of 10 digits only
        - if the phone number does not consis of 10 digits
          - throw 'need valid phone number with area code' error
        - else set key as 'phone' and value as the input number

      example:  
      contacts = {
        1: {
          name: esther
          email: ekim1009@gmail.com,
          phone: 1232343456
        }
      }
    - create 'deleteContact' method
      - get 'id' of contact you want to delete
      - delete the contact

*/

// const { query } = require("express");

document.addEventListener('DOMContentLoaded', event => {
  class ContactManager {
    constructor () {
      document.querySelector('.homepage-no-contacts').style.display = 'block';
      this.getAllContacts();
      let addButtons = document.querySelectorAll('.add-contact');
      addButtons.forEach(ele => ele.addEventListener('click', e => {this.displayButton(e)}));
      document.querySelector('.new-contact-submit-button').addEventListener('click', e => {this.addCreateContact(e)});
      document.querySelector('.new-contact-cancel-button').addEventListener('click', e => {this.getAllContacts();})

      let name = [];
      document.querySelector('.contact-name-search').addEventListener('keydown', event => {
        if (event.key === 'Backspace' && name.length > 0) {
          name.pop();
        } else {
          name.push(event.key);
        }
        let searchName = name.join('');
        this.getContactsThatStartWith(searchName);
      });

      document.querySelector('.contacts-container').addEventListener('click', e => {
        e.preventDefault();
        let target = e.target;
        let id; 

        if (target.innerHTML === 'Delete') {
          id = target.href.split('/').pop();
          this.deleteContact(id);
        } else if (target.innerHTML === 'Edit') {
          id = target.href.split('/').pop();
          this.editContactForm(id);

          document.querySelector('.edit-submit-button').addEventListener('click', event => {
          event.preventDefault();
   
          this.submitEdit(id);
  
          // console.log(event.target, id)
        });
        }
      });
    }

    getContactsThatStartWith(name) {
      this.getAllContacts()
        .then(contacts => {
          let allContacts = [];
          for (let i = 0; i < contacts.length; i += 1) {
            allContacts.push(contacts[i]);
          };

          let filteredContacts = contacts.filter(obj => {
            let fullName = obj['full_name'].split(' ');
            console.log(fullName);
            if (fullName[0].startsWith(name.charAt(0).toUpperCase() + name.substring(1)) || fullName[fullName.length - 1].startsWith(name.charAt(0).toUpperCase() + name.substring(1))) {
              return obj;
            }
          });
          
          document.querySelector('.back-to-all-contacts').style.display = 'block';
          this.displayContacts(filteredContacts);
        });
    }

    getContactsWithTag(tag) {
      this.getAllContacts()
        .then(contacts => {
          let contactsWithTag = [];
          for (let i = 0; i < contacts.length; i += 1) {
            contactsWithTag.push(contacts[i]);
          };

          let filteredContacts = contactsWithTag.filter(obj => {
            for (let i = 0; i < obj['tags'].length; i += 1) {
            }
            if (obj['tags'].includes(tag)) {
              return obj;
            }
          });

          document.querySelector('.back-to-all-contacts').style.display = 'block';
          this.displayContacts(filteredContacts);
        });
    }

    displayContacts(contacts) {
      let data = {contacts};
      document.querySelector('.contacts-container').style.display = 'block';
      let contactsTemplate = document.querySelector('#contacts-template').innerHTML;
      let compiledContactsTemplate = Handlebars.compile(contactsTemplate);
      let html = compiledContactsTemplate(data);
      document.querySelector('.contacts-container').innerHTML = html;
    }
    

    displayButton(event) {
      event.preventDefault();
      this.hideElements('create-contact');
      
    }

    addCreateContact(event) {
      event.preventDefault();

      let full_name = document.querySelector('.contact-name-input').value.trim();
      full_name = full_name.charAt(0).toUpperCase() + full_name.slice(1);
      let email = document.querySelector('.email-input').value.trim();
      let phone_number = document.querySelector('.phone-input').value.trim();
      let tags = document.querySelector('.tag-input').value//.split(',').map(str => str.trim());
      
      try {
        this.validName(full_name);
        this.validEmail(email);
        this.validPhone(phone_number);
        tags = this.validTag(tags);
      
        let contactInfo = {full_name, email, phone_number, tags};
        addContact(contactInfo);
      } catch (error) {
        alert(error.message);
        return;
      }

      function addContact(obj) {
        fetch("http://localhost:3000/api/contacts/", {
          method: "POST",
          headers: {"content-type": "application/json"},
          body: JSON.stringify(obj)
        })
          .then(response => response.json())
          .catch(error => console.log('Error:', error));
      }

      this.hideElements('.add-contact-header')
      document.querySelector('.add-contact-header').style.display = 'block';
      document.querySelector('.contact-form').reset();
      this.displayHomePage();
    }

    displayHomePage() {
      this.getAllContacts();
    }

    getAllContacts() {
      return fetch('http://localhost:3000/api/contacts')
        .then(response => response.json())
        .then(json => {
          console.log(json)
          json.forEach(ele => console.log(ele.tags));
          if (json.length === 0) {
            document.querySelector('.homepage-no-contacts').style.display = 'block';
            document.querySelector('.contacts-container').style.display = 'none';
          } else {
            displayAllContacts(json);

            let contactsTags = [...document.querySelectorAll('.tag-display')];

            for (let i = 0; i < contactsTags.length; i += 1) {
              let allTags = contactsTags[i];

              allTags.addEventListener('click', event => {
                event.preventDefault();
                let tag = event.target.innerHTML;
                this.getContactsWithTag(tag);
              });
            };    
            return json;
          };
        });


      function displayAllContacts(contacts) {
        let data = {contacts};
        document.querySelector('.contacts-container').style.display = 'block';

        if (Object.keys(data).length === 0) {
          document.querySelector('.contacts-container').style.display = 'none';
        } else {
          let contactsTemplate = document.querySelector('#contacts-template').innerHTML;
          let compiledContactsTemplate = Handlebars.compile(contactsTemplate);
          let html = compiledContactsTemplate(data);
          
          document.querySelector('.contacts-container').innerHTML = html;
          document.querySelector('.homepage-no-contacts').style.display = 'none';
        };
        console.log(data)
      };
    }

    editContactForm(id) {
      let inputFields = document.querySelectorAll('[class$="input"]');
      this.hideElements('edit-contact');

      fetch('http://localhost:3000/api/contacts/' + id)
        .then(response => response.json())
        .then(json => {
          prefillForm(json, inputFields)
        })
        .catch(error => {console.error('Error fetching contact data:', error);});

      function prefillForm(formData, input) {
        for (let i = 0; i < input.length; i += 1) {
          if (input[i].classList.contains('edit-name-input')) {
            input[i].value = formData['full_name'];
          } else if (input[i].classList.contains('edit-email-input')) {
            input[i].value = formData['email'];
          } else if (input[i].classList.contains('edit-phone-input')) {
            input[i].value = formData['phone_number'];
          } else if (input[i].classList.contains('edit-tag-input')) {
            input[i].value = formData['tags'];
          }
        }
      }
    }

    submitEdit(id) {
      function collectUpdatedContactInfo() {
        let full_name = document.querySelector('.edit-name-input').value.trim();
        let email = document.querySelector('.edit-email-input').value.trim();
        let phone_number = document.querySelector('.edit-phone-input').value.trim();
        let tags = document.querySelector('.edit-tag-input').value.trim();

        this.validName(full_name);
        this.validEmail(email);
        this.validPhone(phone_number);
        this.validTag(tags);

        return {id, full_name, email, phone_number, tags};
      };

      let updatedContact = collectUpdatedContactInfo.call(this);

      fetch('http://localhost:3000/api/contacts/' + id, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedContact),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update contact');
        }
        console.log('Contact updated successfully');
        document.querySelector('.edit-contact').style.display = 'none';
        document.querySelector('.add-contact-header').style.display = 'block';
        this.displayHomePage();
      })
      .catch(error => {
        console.error('Error updating contact:', error);
      });
    }

    deleteContact(id) {
      fetch('http://localhost:3000/api/contacts/' + id, {
        method: 'Delete',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete contact')
          } else {
            alert('Contact deleted successfully')
          }
        })

      this.displayHomePage();
    }

    hideElements(node) {
      console.log(node);
      let nodes = document.querySelector('.style').children;
      for (let i = 0; i < nodes.length; i += 1) {
        let tag = nodes[i].getAttribute('class');
        if (tag !== node) {
          nodes[i].setAttribute('style', 'display: none');
        } else {
          nodes[i].setAttribute('style', 'display: block');
        }
      };
      document.querySelector('.add-contact-header').style.display = 'none';
    }

    validName(name) {
      if ((name).trim() === '') {
        throw new Error('You must enter a valid name');
      } 
    }

    validEmail(email) {
      if (!email.includes('@')) {
        throw new Error(`Please include an '@' in the email address. '${email}' is missing an '@'.`);
      } else if (email[email.length - 1] === '@') {
        throw new Error(`Please enter a part following '@'.  '${email}' is incomplete.`);
      } else if (email.slice(email.length - 4) !== '.com') {
        throw new Error('Please enter a valid email.');
      };
    }

    validPhone(number) {
      if (!/^\d+$/.test(number)) {
        throw new Error('Phone number must only contain numbers.');
      } else if (number.length !== 10) {
        throw new Error('Please enter a valid 10 digit phone number.  It must include the area code.');
      };
    }

    validTag(tag) {
      return tag.split(',').map(str => {
        if (str.trim() !== '') {
          return str.trim();
        } else {
          throw new Error('Please enter a tag!');
        };
      });
    }
  }

  let contactManager = new ContactManager();

})