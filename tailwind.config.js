/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["views/*.ejs", "views/inc/*.ejs"],
    theme: {
        extend: {
            screens: {
                'xs': '430px',
            },
        },
        plugins: [],
    }
}