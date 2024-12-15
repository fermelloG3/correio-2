particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 100, // Cantidad de partículas
            "density": {
                "enable": true,
                "value_area": 800 // Distribución en el área
            }
        },
        "color": {
            "value": "#ffffff" // Color de las partículas
        },
        "shape": {
            "type": "circle", // Forma: circle, edge, triangle, etc.
            "stroke": {
                "width": 0, // Sin borde en las partículas
                "color": "#000000"
            }
        },
        "opacity": {
            "value": 0.5, // Transparencia
            "random": false
        },
        "size": {
            "value": 3, // Tamaño de partículas
            "random": true
        },
        "line_linked": {
            "enable": true,
            "distance": 150, // Distancia entre líneas
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 2, // Velocidad de movimiento
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse" // Interacción al pasar el cursor
            },
            "onclick": {
                "enable": true,
                "mode": "push" // Interacción al hacer clic
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8
            },
            "repulse": {
                "distance": 200
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    }
});
