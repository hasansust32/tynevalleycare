/**
 * ENQUIRY PAGE CONTENT
 * --------------------
 * Text, form labels and options for enquire.html. The form's behaviour is in src/assets/js/enquiry-form.js.
 * If you rename a field `name`, Formspree will simply show the new name in your emails.
 */

export default {
  meta: {
    title: "Make an enquiry | Newcastle Tyne Valley Domiciliary Care",
    description:
      "Send an enquiry about home care in Newcastle upon Tyne or the Tyne Valley. Tell us who needs support and we will reply by email.",
  },

  heading: "Make an enquiry",
  intro:
    "Tell us a little about the care you are looking for. We will reply by email to arrange a time to talk. Making an enquiry does not commit you to anything.",
  image: {
    src: "assets/images/letter-heather.svg",
    alt: "",
    width: 360,
    height: 360,
  },

  form: {
    requiredNote: "All questions are required unless marked optional.",
    sections: {
      you: "Your details",
      care: "About the care",
    },
    fields: {
      name: { label: "Full name", autocomplete: "name" },
      email: {
        label: "Email address",
        hint: "We will only use this to reply to your enquiry.",
        autocomplete: "email",
      },
      postcode: {
        label: "Postcode",
        hint: "The postcode where care would take place, so we can check we cover the area.",
        autocomplete: "postal-code",
      },
      careFor: {
        label: "Who requires care?",
        options: [
          "Me",
          "My parent",
          "My partner or spouse",
          "Another family member",
          "A friend or neighbour",
          "Someone else",
        ],
      },
      careTypes: {
        label: "Type of care required",
        hint: "Choose all that apply.",
        options: [
          "Personal care",
          "Companionship care",
          "Medication support",
          "Respite care",
          "Live-in care",
          "Dementia care",
          "Daily living assistance",
          "Home support",
          "Not sure yet",
        ],
      },
      startDate: {
        label: "Preferred start date",
        hint: "Leave blank if you are not sure yet.",
      },
      message: {
        label: "Additional information",
        hint: "Anything that would help us understand the situation. Please do not include detailed medical information here; we will talk about that in person.",
        maxLength: 1500,
      },
      consent: {
        label:
          "I agree to Newcastle Tyne Valley Domiciliary Care using the information in this form to respond to my enquiry, as explained in the",
        linkText: "privacy notice",
      },
    },
    submit: "Submit enquiry",
    submitting: "Sending your enquiry…",
  },

  next: {
    heading: "What happens next",
    steps: [
      "We read your enquiry and reply by email.",
      "We arrange a time to talk about the support you need.",
      "If you would like to go ahead, we visit to plan your care together.",
    ],
  },

  contactHeading: "Contact us",
};
