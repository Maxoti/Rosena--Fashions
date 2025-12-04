        // Replace with your actual WhatsApp number (country code + number, no + or spaces)
        const WHATSAPP_NUMBER = '254737867028';

        function sendWhatsApp(productName, price) {
            const message = `Hi! I'm interested in the ${productName} (Ksh ${price}). Can you provide more details?`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        }

        function sendCustomMessage() {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            if (!name || !phone || !message) {
                alert('Please fill in all fields');
                return;
            }

            const fullMessage = `Hi! My name is ${name}.\nPhone: ${phone}\n\nMessage: ${message}`;
            const encodedMessage = encodeURIComponent(fullMessage);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');

            document.getElementById('name').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('message').value = '';
        }

        function openWhatsApp() {
            const message = 'Hi! I would like to know more about your products.';
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        }

        function getDirections() {
            const message = 'Hi! I would like to get directions to your store.';
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        }

        // Smooth scrolling for navigation
        document.querySelectorAll('nav a').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
