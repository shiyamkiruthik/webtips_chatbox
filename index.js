//Connected with server with socket.io
var socket = io.connect("http://localhost:4000");

//Query DOM
var message = document.getElementById("message");
var inputName = document.getElementById("user");
var button = document.getElementById("send");
var output = document.getElementById("output");
var infoBox = document.getElementById("feedback");
var submitButton = document.getElementById("submit");
var infoPage = document.getElementById("info-form");
var chatPage = document.getElementById("chat-page");
var userName = document.getElementById("chat-page-header");
var onlineDisplay = document.getElementById("display-user");
var onlineUsers = document.getElementById("online-user");

// In the User name input, if enter is pressed, sumbit button will be clicked.
inputName.addEventListener("keydown", function (event) {
	if (event.key == "Enter") {
		submitButton.click();
	}
});

// If the submit button is clicked, the user name is assigned in a variable,
// the user name is emitted to the server to the server, to show other users that he/she is online,
// the information page is changed to hidden and chat page is displayed.
// These actions will take place only if the user name is entered, if it is empty then the user is asked to enter the name.
submitButton.addEventListener("click", () => {
	if (!inputName.value.length == 0) {
		userName.innerHTML = `<em>${inputName.value}</em>`;
		socket.emit("join", inputName.value);
		infoPage.style = "display:none";
		chatPage.style = "display:block";
	} else {
		inputName.placeholder = "Please enter a name";
	}
});

// In the message input, if enter is pressed, send button will be clicked.
message.addEventListener("keypress", function (event) {
	if (event.key == "Enter") {
		button.click();
	}
});

// If the send button is clicked, the content in the infoBox div is cleared,
// in the output div the message you send is appended in the right side,
// the time when the message is also appended with the message.
// the message and the username is emitted to the server.
// These actions will take place only if the message is entered, if it is empty then the user is asked to enter the message.
button.addEventListener("click", function () {
	if (!message.value.length == 0) {
		var sendTime = fetchTime();
		infoBox.innerHTML = "";
		output.innerHTML += `<p class='my-message'>${message.value}&emsp;<span class='sender-time'>${sendTime}</span></p>`;
		socket.emit("chat", { message: message.value, inputName: inputName.value });
		message.value = "";
	} else {
		infoBox.innerHTML += `<p><em>${inputName.value}, you didn't add any message. Please enter the message</em></p>`;
	}
});

// If the user starts typing, the user name is emiited with a message typing.
message.addEventListener("keydown", function () {
	socket.emit("typing", inputName.value);
});

var displayTime;

// function to make the online user names to disappear after 3 seconds.
function displayOnlineUsers() {
	onlineDisplay.style.display = "none";
	clearTimeout(displayTime);
}

// when the online user button is clicked, it will emit a message "online" to the server.
// And make the user name div appear and call a function to make it disappear after 3 seconds.
onlineUsers.addEventListener("click", () => {
	socket.emit("online");
	onlineDisplay.style.display = "block";
	var displayTime = setTimeout(displayOnlineUsers, 3000);
});

// If received message is 'chat', then the infoBox content will be cleared, the output div is appended with the message with the sender name,
socket.on("chat", function (data) {
	var recieveTime = fetchTime();
	infoBox.innerHTML = "";
	output.innerHTML +=
		"<p class='other-message'><strong><em>" +
		data.inputName +
		"</em></strong><br>&emsp;&emsp;" +
		data.message +
		"&emsp;<span class='receiver-time'>" +
		recieveTime +
		"</span>";
	("</p>");
});

// If received message is 'typing', then the infoBox div is appended with sender name, that he/she is typing
socket.on("typing", function (data) {
	infoBox.innerHTML = "<p><em>" + data + "  is typing a message....</em></p>";
});

// If received message is 'join', the output div will append with the sender name, that he/she is online
socket.on("join", (data) => {
	output.innerHTML += `<p style='text-align: center'><em>${data} is online</em></p>`;
});

// If received message is 'left', the output div will append with the name that he/she is offline.
socket.on("left", (leftName) => {
	if (!(leftName.length == 0)) {
		console.log(leftName);
		output.innerHTML += `<p style='text-align: center; color: red'><em>${leftName} is offline</em></p>`;
	}
});

// If received message is 'online', the user display div will bbe appended with the participants name who all are in online.
socket.on("online", (onlineNames) => {
	var participants = "Online Users : ";
	for (names in onlineNames) {
		participants += `${onlineNames[names]} | `;
	}
	onlineDisplay.innerHTML = participants;
});

// Function which fetch the current time and return the time to the div where the message is appended. So that, the message will show the time
// at which the message has send.
function fetchTime() {
	var time = new Date();
	var hours = new Date(time).getHours();
	var minute = new Date(time).getMinutes();
	hours = hours < 10 ? `0${hours}` : hours;
	minute = minute < 10 ? `0${minute}` : minute;
	var exactTime = hours + ":" + minute;
	return exactTime;
}
