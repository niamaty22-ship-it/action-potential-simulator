// =========================
// ELEMENTS
// =========================

const fireButton = document.getElementById("fireButton");
const neuron = document.querySelector(".neuron");

const graph = document.getElementById("actionPotentialGraph");
const ctx = graph.getContext("2d");

const graphSignal = document.getElementById("graphSignal");

const phaseLabel = document.getElementById("phaseLabel");
const phaseDescription = document.getElementById("phaseDescription");

let currentPhase = "";


// =========================
// PHASE CHANGE ANIMATION
// =========================

function updatePhase(label, description) {

    // Don't animate if the phase hasn't changed
    if (currentPhase === label) {
        return;
    }

    currentPhase = label;

    // Fade out + shrink
    phaseLabel.style.opacity = "0";
    phaseLabel.style.transform = "scale(0.9)";

    phaseDescription.style.opacity = "0";

    setTimeout(function () {

        phaseLabel.textContent = label;
        phaseDescription.textContent = description;

        // Fade in + pop
        phaseLabel.style.opacity = "1";
        phaseLabel.style.transform = "scale(1)";

        phaseDescription.style.opacity = "1";

    }, 120);
}


// =========================
// GRAPH DIMENSIONS
// =========================

const left = 70;
const right = 560;
const graphTop = 30;
const bottom = 250;


// =========================
// DRAW GRAPH
// =========================

function drawGraph() {

    ctx.clearRect(0, 0, graph.width, graph.height);

    // Y axis
    ctx.beginPath();

    ctx.moveTo(left, graphTop);
    ctx.lineTo(left, bottom);

    ctx.strokeStyle = "#a8c7b5";
    ctx.lineWidth = 2;

    ctx.stroke();


    // X axis
    ctx.beginPath();

    ctx.moveTo(left, bottom);
    ctx.lineTo(right, bottom);

    ctx.stroke();


    // Labels
    ctx.fillStyle = "#a8c7b5";
    ctx.font = "14px Arial";

    ctx.fillText("+30 mV", 10, 45);
    ctx.fillText("0 mV", 25, 135);
    ctx.fillText("-55 mV", 10, 195);
    ctx.fillText("-70 mV", 10, 255);


    // Threshold line
    ctx.beginPath();

    ctx.moveTo(left, 205);
    ctx.lineTo(right, 205);

    ctx.strokeStyle = "#4f8065";
    ctx.lineWidth = 1;

    ctx.setLineDash([6, 6]);

    ctx.stroke();

    ctx.setLineDash([]);
}


// =========================
// ACTION POTENTIAL DATA
// =========================

const points = [
    [-70, 0],
    [-70, 1],
    [-68, 2],
    [-65, 3],
    [-60, 4],
    [-55, 5],
    [-40, 6],
    [0, 7],
    [30, 8],
    [20, 9],
    [0, 10],
    [-40, 11],
    [-70, 12],
    [-80, 13],
    [-70, 14]
];


// =========================
// VOLTAGE → Y POSITION
// =========================

function yPosition(voltage) {

    return bottom - ((voltage + 70) * 3);

}


// =========================
// DRAW COMPLETE ACTION POTENTIAL
// =========================

function drawActionPotential() {

    ctx.beginPath();

    points.forEach(function(point, index) {

        const voltage = point[0];
        const time = point[1];

        const x = left + time * 35;
        const y = yPosition(voltage);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

    });

    ctx.strokeStyle = "#7ee2a8";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.stroke();
}


// =========================
// ANIMATE ACTION POTENTIAL
// =========================

function animateActionPotential() {

    let progress = 0;

    graphSignal.style.opacity = "1";

    const animation = setInterval(function() {

        drawGraph();

        ctx.beginPath();

        for (let i = 0; i < points.length - 1; i++) {

            const current = points[i];
            const next = points[i + 1];

            const startTime = current[1];
            const endTime = next[1];


            // Completed section
            if (progress >= endTime) {

                const x = left + endTime * 35;
                const y = yPosition(next[0]);

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

            }


            // Currently animating section
            else if (progress >= startTime) {

                const sectionProgress =
                    (progress - startTime) /
                    (endTime - startTime);

                const voltage =
                    current[0] +
                    (next[0] - current[0]) *
                    sectionProgress;

                const time =
                    startTime +
                    (endTime - startTime) *
                    sectionProgress;

                const x = left + time * 35;
                const y = yPosition(voltage);


                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }


                // Move graph signal
                graphSignal.style.left = `${x - 6}px`;
                graphSignal.style.top = `${y - 6}px`;

                break;
            }
        }


        // Draw the animated graph line
        ctx.strokeStyle = "#7ee2a8";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.stroke();


        // Animation speed
        progress += 0.25;


        // =========================
        // UPDATE PHASE LABEL
        // =========================

        if (progress < 5) {

            updatePhase(
                "Resting Potential",
                "The neuron is ready to fire. Its membrane is at about −70 mV."
            );

        }

        else if (progress < 6) {

            updatePhase(
                "Threshold",
                "The membrane reaches threshold. An action potential is triggered."
            );

        }

        else if (progress < 8) {

            updatePhase(
                "Depolarization",
                "Sodium ions (Na⁺) enter the neuron, making the membrane more positive."
            );

        }

        else if (progress < 9) {

            updatePhase(
                "Peak",
                "The membrane reaches its most positive point."
            );

        }

        else if (progress < 12) {

            updatePhase(
                "Repolarization",
                "Potassium ions (K⁺) leave the neuron, bringing the membrane potential back down."
            );

        }

        else if (progress < 14) {

            updatePhase(
                "Hyperpolarization",
                "The membrane briefly becomes more negative than its resting potential."
            );

        }

        else {

            updatePhase(
                "Resting Potential",
                "The neuron has returned to its resting state."
            );

        }


        // =========================
        // END ANIMATION
        // =========================

        if (progress >= points.length - 1) {

            clearInterval(animation);

            drawGraph();
            drawActionPotential();

            graphSignal.style.opacity = "0";

        }

    }, 40);
}


// =========================
// FIRE NEURON
// =========================

fireButton.addEventListener("click", function() {

    // Restart neuron animation
    neuron.classList.remove("fired");

    void neuron.offsetWidth;

    neuron.classList.add("fired");


    // Start graph animation
    animateActionPotential();


    // Stop neuron firing after 3 seconds
    setTimeout(function() {

        neuron.classList.remove("fired");

    }, 3000);

});


// =========================
// INITIAL STATE
// =========================

drawGraph();

updatePhase(
    "Resting Potential",
    "The neuron is ready to fire."
);