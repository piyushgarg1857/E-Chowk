require('dotenv').config();
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

client.incomingPhoneNumbers.list({ limit: 1 })
  .then(numbers => {
    if (numbers.length === 0) {
      console.error('No Twilio number found!');
      return;
    }
    const fromNumber = numbers[0].phoneNumber;
    console.log('Found Twilio Number: ' + fromNumber);

    return client.calls.create({
      url: 'https://concretionary-alberta-mineralogically.ngrok-free.dev/voice/incoming',
      to: '+91 8764336371', // Your verified number
      from: fromNumber
    });
  })
  .then(call => console.log('📞 Calling your mobile: ' + call.to))
  .catch(e => console.error(e));
