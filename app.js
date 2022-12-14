const canvas = document.querySelector("canvas")
let scoreGame = document.querySelector("#score")
const ctx = canvas.getContext("2d")


// * Tailles definis par le "style.css"
canvas.width = canvas.clientWidth
canvas.height = canvas.clientHeight

console.log(canvas.height);

// * Objet touches clavier
    // Par défaut "false" puisqu'aucune touche appuyée
const keys = {
    ArrowLeft : {
        pressed : false
    },
    ArrowRight : {
        pressed : false
    }
}
// todo =====================
// todo ====== CLASSES ====== 
// todo ===================== 

// ? notes : on indiques des paramètres dans le constructeur si on doit faire un tableau

class Player {
    // * A chaque fois qu'on instanciera un joueur -> parametres du constructeur
    constructor() {
        this.velocity = {
            x : 0, // * sur l'axe X
            y : 0, // * sur l'axe Y
        }

        this.rotation = 0
        this.opacity = 1

        const image = new Image()
        image.src = "./space.png"
        image.onload = () => {
            const scale = 0.10 // * Adapte taille image
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                 // * au centre
                x: canvas.width/2 -this.width/2,
                // * moins hauteur du joueur pour voir  
                y: canvas.height-this.height - 20
            }
        }
    }

    // * Methodes
    draw() {
        // * On dessine le joueur

        ctx.save() // ? img en temps réel
        ctx.globalAlpha = this.opacity
        // ! translate pour faire bouger le vaissau à partir du milieu
        ctx.translate(
            player.position.x + player.width/2, 
            player.position.y + player.height/2
        )

        ctx.rotate(this.rotation)

        ctx.translate(
            - player.position.x - player.width/2, 
            - player.position.y - player.height/2
        )

        ctx.drawImage(
            this.image,
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )

        ctx.restore()
    }

    update() {
        // * On met à jour le dessin du joueur lors de chaque déplacement
        if(this.image){
            if(keys.ArrowLeft.pressed && this.position.x >= 0) {
                this.velocity.x = -5
                this.rotation = -0.3
            }else if(keys.ArrowRight.pressed && this.position.x <= canvas.width-this.width) {
                this.velocity.x = 5
                this.rotation = 0.3
            } else {
                this.velocity.x = 0 
                this.rotation = 0
            }

            this.position.x += this.velocity.x
            this.draw()
        }
    }

    // * Tirer un missile
    shoot() {
        missiles.push(new Missile( {
            position : {
                // ! tire à partir du centre du joueur
                x:this.position.x + this.width/2 - 2,
                y:this.position.y - 4
            }
        }))
    }
}
class Alien {
    constructor({position}) { // ! la position dependra d'autres facteurs externes (class GRID)
        this.velocity = {
            x : 0,
            y : 0
        }
        const image = new Image()
        image.src = "./alien.png"
        image.onload = () => {
            const scale = 0.05    // * Adapte taille image
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x : position.x,
                y : position.y
            }
        }
    }

    draw() {
        if(this.image) {
            ctx.drawImage(
                this.image,
                this.position.x, 
                this.position.y, 
                this.width, 
                this.height
            )
        }
    }

    update({velocity}) { // ! depend vitesse de la grille
        if(this.image) {
            this.position.x += velocity.x
            this.position.y += velocity.y // ! à chaque bord, il descend
            if(this.position.y + this.height >= canvas.height) {
                // alert("You loose !");
                gameOver()
                // init()
            } 
        }
        this.draw()
    }

    shoot(alienMissiles) {
        if(this.position) {
            // * on instancie un nouveau missile
            alienMissiles.push(new alienMissile( {
                position : {
                    x : this.position.x + this.width /2,
                    y : this.position.y + this.height - 5
                },
                velocity : {
                    x : 0,
                    y : 3
                }
            }))
        }
    }
}
class Grid {
    constructor() {
        this.position = {
            x : 0,
            y : 0
        }
        this.velocity = {
            x : 0.5,
            y : 0
        }
        // * Tableau d'aliens
        this.invaders = []

        // * : 34px car img 32px... 1/3 lignes occupées, 2/3 espace occupé
        // let rows = Math.floor((canvas.height/38)*(1/3))
        // * nombre de lignes aléatoire
        const rows = Math.floor(Math.random() * 5 +1)
        // const cols = Math.floor((canvas.width/38)*(3/5))
        const cols = Math.floor(Math.random() * 10 +2)

        this.height = rows*38
        this.width = cols*38 // ! pour calcul width total

            // ! double boucle "for" pour mettre en place chaque alien dans le colonnes et lignes
        for (let x=0; x<cols; x++) {
            for (let y=0; y<rows; y++) {
                this.invaders.push(new Alien({
                    position : {
                        x : x*38,
                        y : y*38
                    }
                }))
            }
        }
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.velocity.y = 0 // ! se remet à 0 apres condition
        if(this.position.x + this.width >= canvas.width || this.position.x === 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 34 // ! on descend de 34px après avoir touché le bord
        }
    }
}

class Missile {
    // * {position} étant la référence au para du joueur
    constructor({position}) { // ! Destructure le paramètre
        this.position = position
        this.velocity = {
            x:0,
            y:-5
        }
        this.width = 4
        this.height = 15
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle = "#be2f12"
// * Tir central
        ctx.fillRect(
            this.position.x, 
            this.position.y, 
            this.width,
            this.height
        )
// * Tir droite
        // ctx.fillRect(this.position.x +20, this.position.y, this.width,this.height)
// * Tir gauche        
        // ctx.fillRect(this.position.x -20, this.position.y + 100, this.width,this.height)

        ctx.closePath() 
    }

    update() {
        this.position.y += this.velocity.y
        this.draw()
    }
}
class alienMissile {
    // * velocity pour ajout aléatoire de vitesse de tirs
    constructor({position,velocity}) {
        this.position = position
        this.velocity = velocity
        this.width = 5
        this.height = 10
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle ="#df1"
        ctx.fillRect(this.position.x, this.position.y, this.width,this.height)
        ctx.fill()
        ctx.closePath()
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.draw()
    }
}
class Particule {
    constructor({position, velocity, radius, color, fades}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fades = fades
    }

    draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2)
        ctx.fill()
        ctx.closePath()
        ctx.restore() // ! conserve les données plus haut
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if(this.fades) {
            this.opacity -= 0.01
        }
        this.draw()
    }
}

// todo =====================
// todo == INITIALISATION === 
// todo ===================== 

// * Stocker missiles et particules dans un tableau
let missiles
let alienMissiles
let particules = []

// * Avoir les aliens dès le départ
let grids
let player
let lifes
// * Pour ajout évènements après ittération
let frames =0
let game = {
    over : false,
    active : true
}
let score

const init = () => {
    missiles = []
    alienMissiles = []
    grids = [new Grid()]
    player = new Player()
    lifes = 3
    score = 0 
    scoreGame.innerHTML = `${score}`
    keys.ArrowLeft.pressed = false
    keys.ArrowRight.pressed = false
    game.over = false
    game.active = true
}

// * ====== Etoiles ======

for(let p=0; p<100; p++) { 
    particules.push(new Particule ( {
        position : {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        }, 
        velocity:{
            x:0,
            y:0.1
        },
        radius: Math.random()*2 + 0.5, 
        color: "red"
    }
    ))

    function getRandomColour(){
        let red = Math.floor(Math.random() * (256 - 220) + 220);
        let green = Math.floor(Math.random() * (256 - 150) + 150);
        let blue = Math.floor(Math.random() * (256 - 150) + 150);
        return "rgb("+red+","+green+"," +blue+" )";  
    }

    particules.forEach(particule => {
        particule.color = getRandomColour()
    })
}

init()

// todo =====================
// todo ===== ANIMATION ===== 
// todo ===================== 
function animationLoop() {
    if(!game.active) return
    requestAnimationFrame(animationLoop)
    
    // * Remet à Zero avant l'update
    ctx.clearRect(0,0,canvas.width,canvas.height)
    player.update()

    // * On parcourt le tableau des missiles
    missiles.forEach((missile, index) => {
        if(missile.position.y + missile.height <= 0) {
            // * si misille sort du jeu, on le supprime du tableau apres chaque "setTimeout"
            setTimeout(() => {
                missiles.splice(index,1)} 
                ,0)
            } else {
                // * sinon on le met à jour
                missile.update()
            }
    })

    grids.forEach((grid, indexGrid) => {
        grid.update() 
        // * Si tous les multiple X "frames" et au moins 1 "alien" => choisit aléatoirement un alien qui tire
        if(frames %80 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random()*(grid.invaders.length))].shoot(alienMissiles) 
        }

        grid.invaders.forEach((invader, indexInvader) => {
            // * on leur passe le même paramètre pour qu'ils se déplacent en même temsp 
            invader.update({velocity : grid.velocity})

            // ! Collision avec misilles
            missiles.forEach((missile, indexMissile) => {
                // * si le missile se trouve entre point le plus haut et plus bas
                if(missile.position.y <= invader.position.y + invader.height &&
                missile.position.y >= invader.position.y &&
                // * entre le point le plus à gauche et le plus à droite
                missile.position.x + missile.width >= invader.position.x &&
                missile.position.x - missile.width <= invader.position.x + invader.width) {
                    // ! Gerer les particules
                    for(let p=0; p<12; p++) { //*12particuels
                        particules.push(new Particule ( {
                            position : {
                                x: invader.position.x + invader.width/2,
                                y: invader.position.y + invader.height/2
                            }, // ! au milieu de l'alien
                            velocity:{
                                // ! (negatif pour sens inverse)
                                x:(Math.random()-0.25)*2,
                                y:(Math.random()-0.5)*2
                            },
                            radius: Math.random()*3+1, // ! pour avoir au moins 1 particule
                            color: "red",
                            fades : true
                        }))
                    }
                        
                    
                    console.log(score);      

                    setTimeout(() => {
                        // * si collision, alien + missile disparait
                        grid.invaders.splice(indexInvader,1)
                        missiles.splice(indexMissile,1)
                        // ! score
                        score += 100
                        scoreGame.innerHTML = `${score}`

                        // * recalculer width du groupe d'aliens
                        if(grid.invaders.length > 0) {
                            const firstInvader = grid.invaders[0]
                            const lastInvader = grid.invaders[grid.invaders.length -1]
                            grid.width = lastInvader.position.x - firstInvader.position.x  + lastInvader.width
                            grid.position.x = firstInvader.position.x
                        }

                        if(grid.invaders.length === 0 && grids.length === 1) { 
                            grids.splice(indexGrid,1)
                            grids.push(new Grid())
                        }
                    },0)
                }
            })
        })
    })

    alienMissiles.forEach((alienMissile, index) => {
        if(alienMissile.position.y + alienMissile.height >= canvas.height) {
            setTimeout(() => {
                alienMissiles.splice(index,1)} 
                ,0)
        } else {
            alienMissile.update()
        }
        // ! Collision avec misilles
        if(alienMissile.position.y + alienMissile.height >= player.position.y &&
        alienMissile.position.y <= player.position.y + player.height &&
        alienMissile.position.x >= player.position.x &&
        alienMissile.position.x + alienMissile.width <= player.position.x + player.width) {
            setTimeout(() => {
                alienMissiles.splice(index,1)
                // player.opacity = 0
                // game.over = true
            },0)

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ! CONFIGURER NOMBRE DE VIES, FRAMES INVINVIBILITE !
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

            // setTimeout(() => {
            //     game.active = false
            // }, 2000) // ! 2000 miliseconds => 2s

            // ! Gerer les particules
            for(let p=0; p<22; p++) { //*12particuels
                particules.push(new Particule ( {
                    position : {
                        x: player.position.x + player.width/2,
                        y: player.position.y + player.height/2
                    }, // ! au milieu du vaissau
                    velocity:{
                        x:(Math.random()-0.5)*2,
                        y:(Math.random()-0.5)*2
                    },
                    radius: Math.random()*2+1, 
                    color: "white",
                    fades : true
                }))
            }
            lostLife()
        }
    })

    particules.forEach((particule, indexParticule) => {
        if(particule.position.y - particule.radius >= canvas.height) {
            particule.position.x = Math.random() * canvas.width
            particule.position.y = -particule.radius
        }

        if(particule.opacity <=0) {
            particules.splice(indexParticule,1)
        } else {
            particule.update()
        }
    })


    // todo : ajout evenements....

    // if(frames % 1200 === 0){
    //     grids.push(new Grid())
    // }


    frames++
}
animationLoop()

const lostLife = () => {
    lifes--
    if(lifes <= 0) {
        alert("perdu")
        init()
    }
}

const gameOver = () => {
    alert("perdu")
    init()
}

// scorePoint()

// todo =====================
// todo === TOUCHE CLAVIER == 
// todo ===================== 

// * Evenement si touche gauche ou droite est pressée
// ! {key} <-- destructuration de l'objet Event pour avoir le "key". Sinon on peut : "event.key"
document.addEventListener("keydown", ({key}) => {
    // * Empecher d'utiliser les touches
    if(game.over) return
    switch(key) {
        // * nom de la key pressée
        case "ArrowLeft" :
            keys.ArrowLeft.pressed = true
            // console.log("à gauche")
            break
        case "ArrowRight" :
            keys.ArrowRight.pressed = true
            // console.log("à droite")
            break
        case " " : // ! Touche "espace"
    }
})



document.addEventListener("keyup", ({key}) => {
    if(game.over) return

    switch(key) {
        // * nom de la key pressée
        case "ArrowLeft" :
            keys.ArrowLeft.pressed = false
            break
        case "ArrowRight" :
            keys.ArrowRight.pressed = false
            break
        case " " : // ! Touche "espace"
            player.shoot()
            // console.log(missiles);
            // break
    }
})


// todo 1: Tirer laser à interval régulier quand touche "espace" est pressée; doit être moins rapide qu'appuyer successivement sur cette mêmee touche  



// todo 2: Afficher interface


// TODO ULTIME : Creer systeme de points = argent; permet d'acheter armes et amelioration durant la partie.
// todo => Rendre ennemie plus resistant (couleur = vie ?)
// todo => Ameliorer le vaissaux (ajout tourelles ?) 
// todo => Achat de "Bonus" pour effet limité (double tir ?)