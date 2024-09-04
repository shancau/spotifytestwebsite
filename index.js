setListeners();

function setListeners() {

    console.log('setListeners')

    document.getElementById("intro").addEventListener("mouseenter", function () {
        console.log('hover');
        document.getElementById("pagination").classList.add("active");
    })

    document.getElementById("intro").addEventListener("mouseleave", function () {
        console.log('hover');
        document.getElementById("pagination").classList.remove("active");
    })

    const links = Array.from(document.getElementsByClassName("links"));

    console.log(links);

    links.forEach(link => {

        const imgText = link.nextElementSibling;

        link.addEventListener('mouseenter', () => {
            console.log('enter');
            imgText.classList.add('textShow');
        });

        link.addEventListener('mouseleave', () => {
            imgText.classList.remove('textShow');
        });

    });
}