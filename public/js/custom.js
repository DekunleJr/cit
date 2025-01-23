

jQuery(document).ready(function () {
    "use strict";

    // Paystack payment logic
    $('#enroll-button').on('click', async function () {
        const courseId = $(this).data('course-id'); 
        const amount = $(this).data('course-price'); 
		const csrfToken = $('meta[name="csrf-token"]').attr('content');
		console.log(courseId)

        try {
            // Call the initialize-payment endpoint
            const response = await fetch('/initialize-payment', {
                method: 'POST',
                headers: {
					'Content-Type': 'application/json',
					'CSRF-Token': csrfToken,
                },
                body: JSON.stringify({ amount, courseId }),
            });

            const { authorizationUrl } = await response.json();
            if (authorizationUrl) {
                // Redirect to Paystack payment page
                window.location.href = authorizationUrl;
            } else {
                alert('Failed to initialize payment.', amount);
            }
        } catch (err) {
            console.error('Error initializing payment:', err);
            alert('An error occurred. Please try again.', err);
        }
    });
});
