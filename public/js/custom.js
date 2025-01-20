jQuery(document).ready(function() {
	
	"use strict";
	// Your custom js code goes here.

});


function payWithPaystack() {
	const email = document.getElementById('email').value;
	const amount = document.getElementById('amount').value;

	const handler = PaystackPop.setup({
		key: '<%= PAYSTACK_PUBLIC_KEY %>', // Replace with your public key
		email,
		amount: amount * 100, // Convert to kobo
		currency: 'NGN',
		callback: async function (response) {
			// Verify payment
			const verifyUrl = `/verify-payment/${response.reference}`;
			const res = await fetch(verifyUrl);
			const data = await res.json();
			if (data.status === 'success') {
				alert('Payment successful!');
			} else {
				alert('Payment verification failed!');
			}
		},
		onClose: function () {
			alert('Transaction was not completed.');
		},
	});

	handler.openIframe();
}
