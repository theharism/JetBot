/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define([
  "knockout",
  "ojs/ojarraydataprovider",
  "ojs/ojinputtext",
  "ojs/ojmessagebanner",
  "ojs/ojprogress-circle",
], function (ko, ArrayDataProvider) {
  function DashboardViewModel() {
    var self = this;

    self.inputMessage = ko.observable("");
    self.showErrorMessage = ko.observable(false);

    self.messages = ko.observableArray([]);

    self.messagesProvider = new ArrayDataProvider(self.messages, {
      keyAttributes: "id",
    });

    self.loading = ko.observable(false);

    self.sendMessage = function () {
      self.loading(true);
      var newMessage = {
        id: self.messages().length + 1,
        message: self.inputMessage().trimEnd(),
        sender: "user",
      };
      self.messages.push(newMessage);

      self.inputMessage("");

      setTimeout(function () {
        var messagesList = document.getElementById("messages");
        messagesList.scrollTop = messagesList.scrollHeight;
      }, 100);

      self.handleResponseMessage();
      // callOpenAI("Hello, how are you?");
    };

    self.handleResponseMessage = async function () {
      try {
        let apiMessages = [];

        for (messageObject of self.messages()) {
          var role = "";
          if (messageObject.sender === "gpt") {
            role = "assistant";
          } else if (messageObject.sender === "user") {
            role = "user";
          } else {
            role = "system";
          }

          apiMessages.push({ content: messageObject.message, role: role });
        }

        apiMessages.unshift({
          content:
            "You are a bot expert in oracle jet. Provide code and theory examples with every question asked.",
          role: "system",
        });

        const response = {
          id: self.messages().length + 1,
          message: "...",
          sender: "gpt",
        };

        self.messages.push(response);

        setTimeout(function () {
          var messagesList = document.getElementById("messages");
          messagesList.scrollTop = messagesList.scrollHeight;
        }, 100);

        const apiKey = ""; // Replace with your actual API key
        const apiUrl = "https://api.openai.com/v1/chat/completions";

        // Parameters to pass to the API
        const data = {
          model: "gpt-4",
          messages: apiMessages,
        };

        const apiResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(data),
        });
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          console.log("Success:", data);
          const openAIResponse = data.choices[0].message.content.trim();
          // Add the response to your message array or display it in your UI
          self.messages.pop();

          const response = {
            id: self.messages().length + 1,
            message: openAIResponse,
            sender: "gpt",
          };

          self.messages.push(response);
        } else {
          console.error("Error:", error);
          throw new Error(error);
        }
      } catch (error) {
        console.error("eee", error);
        self.messages.pop();
        self.showErrorMessage(true);
      } finally {
        self.loading(false);
      }
    };

    self.closeMessage = (event) => {
      self.showErrorMessage(false);
    };

    const initialData = [
      {
        id: "error1",
        severity: "error",
        summary: "An Unexpected Error has occurred",
      },
    ];
    self.errorMessages = new ArrayDataProvider(initialData, {
      keyAttributes: "id",
    });

    self.connected = () => {
      document.title = "JetBot";
    };
  }

  /*
   * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
   * return a constructor for the ViewModel so that the ViewModel is constructed
   * each time the view is displayed.
   */
  return DashboardViewModel;
});
