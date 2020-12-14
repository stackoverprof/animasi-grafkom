 ////////MEMBUAT OBJEK CANVAS
 const Canvas = document.getElementById('canvas')    //Objek diambil dari tag html <canvas> yg memiliki id canvas
 const ctx = Canvas.getContext('2d')                 //object yang mempresentasikan sebuah rendering context yang dua dimensi

 let screenHeight = window.innerHeight               //mengatur ukuran media
 let screenWidth = window.innerWidth

 Canvas.width = screenWidth                          //mengatur ukuran canvas
 Canvas.height = screenHeight

 ////////FUNGSI PENGIMPORT GAMBAR SELURUH SET FRAME ANIMASI
 function getFrameSet(color) {
     const frameset = []
     for (let i = 0; i < 26; i++) {
         frameset[i] = new Image()
         frameset[i].src = `img/frameset/${color}/${i}.png`
     }
     return frameset
 }

 const ImageFrames = {
     yellow: getFrameSet('yellow'),
     brown: getFrameSet('brown'),
     gray: getFrameSet('gray'),
     purple: getFrameSet('purple')
 }

 ////////FUNGSI PENGIMPORT GAMBAR BACKGROUND
 function getImage(source) {
     const image = new Image()
     image.src = source
     return image
 }

 const ImageBackground = {
     line: getImage('img/background/line.png'),
     iron: getImage('img/background/iron.png'),
     corridor: getImage('img/background/corridor.webp'),
     labelNama: getImage('img/nama.png')
 }

 
 ////////OBJECT PLAYER - YANG BISA DIKENDALIKAN DENGAN KEYBOARD
 function PlayerCharacter() {
     this.width = 145
     this.height = 181
     this.velocity = {X: 0, Y: 0}
     this.frame = 0
     this.lane = 0
     this.image = ImageFrames.brown
     
     this.Position = {
         X : screenWidth/2-this.width/2,
         Y : screenHeight - 129 - this.height
     }

     this.Move = () => {
         //Handle perubahan posisi (gerak) //Melarang Player keluar dari sisi layar
         if (this.Position.X + this.velocity.X > 40 && this.Position.X + this.velocity.X < screenWidth - this.width - 40){    
             this.Position.X += this.velocity.X
         }
         if (this.Position.Y + this.velocity.Y > 411 - this.height && this.Position.Y + this.velocity.Y < screenHeight - 98 - 27 - this.height){    
             this.Position.Y += this.velocity.Y 
             this.lane = screenHeight - this.height - this.Position.Y - 129 - 8
         }
     }

     this.Framer = () => {
         let isMoving = this.velocity.X != 0 || this.velocity.Y != 0         //Logic penanyangan frame animasi disesuaikan pada this.velocity

         if (isMoving) {
             this.frame++
             console.log(this.frame)
             if (this.velocity.X < 0 &&                                      //ketika gerak ke kiri
                 (this.frame < 1 || this.frame > 12)) 
                 this.frame = 1
             else if (this.velocity.X > 0 &&                                 //ketika gerak ke kanan
                 (this.frame < 13 || this.frame > 24)) 
                 this.frame = 13
             else if ((this.velocity.Y != 0 && this.frame <= 13) &&           //ketika gerak atas/bawah dan sedang menghadap kiri
                 (this.frame < 1 || this.frame > 12)) 
                 this.frame = 1
             else if ((this.velocity.Y != 0 && this.frame > 13) &&          //ketika gerak atas/bawah dan sedang menghadap kanan
                 (this.frame < 13 || this.frame > 24)) 
                 this.frame = 13
         } else this.frame = this.frame < 13 ? 0 : 25                        //ketika diam
     }
     
     this.Draw = () => {
         //Method ini digunakan untuk merender di canvas
         this.Move()
         this.Framer()
         //Merender ke canvas menggunakan ctx 2D
         ctx.drawImage(this.image[this.frame], this.Position.X, this.Position.Y, this.width, this.height)
     }
 }

 ////////OBJECT NON-PLAYER - FIGUR BERGERAK YANG LEWAT
 function CharacterPasif(color, starting, delay = 0, lane) {
     this.width = 145
     this.height = 181
     this.velocity = starting == 'left' ? 5 : -5
     this.frame = 0
     this.turningArea = Math.random() * screenWidth + screenWidth + this.width*2
     this.lane = lane * (screenHeight-411-98-27)

     //switch sesuai warna karakter yg diminta (untuk memilih mengambil frame set animasi yang mana)
     switch (color) {
         case 'gray':
             this.image = ImageFrames.gray
             break
         case 'yellow':
             this.image = ImageFrames.yellow
             break            
         case 'brown':
             this.image = ImageFrames.brown
             break            
         case 'purple':
             this.image = ImageFrames.purple
             break            
         default:
             this.image = ImageFrames.brown
             break
     }
     
     this.Position = {
         X : starting == 'left' ?  -this.width : screenWidth,
         Y : screenHeight - this.height - this.lane - 129
     }

     this.Move = () => {
         //bagian pergerakan
         this.Position.X += this.velocity - Player.velocity.X*2         
         this.Position.Y = screenHeight - this.height - this.lane - 129
     }
     
     //men-delay kemunculan
     this.isDelayed = true
     setTimeout(() => {
         this.isDelayed = false
     }, delay)

     this.Framer = () => {                                           //Logic penanyangan frame animasi disesuaikan pada this.velocity
         if (this.velocity < 0 && 
             (this.frame < 1 || this.frame > 12))                    //Gerak ke kiri
             this.frame = 1
         else if (this.velocity > 0 &&                             //Gerak ke kanan
             (this.frame < 13 || this.frame > 24)) 
             this.frame = 13
     }

     //method ini digunakan untuk merender di canvas
     this.Draw = () => {
         if (!this.isDelayed){
             //bagian ini supaya figur bolak balik ke kanan dan kiri (tidak hilang begitu saja)
             if (this.Position.X + this.velocity < screenWidth/2-this.turningArea/2){    
                 this.velocity = 5
                 this.lane = Math.random() * (screenHeight-411-98-27)
             } else if (this.Position.X + this.velocity > screenWidth/2 + this.turningArea/2){
                 this.velocity = -5
                 this.lane = Math.random() * (screenHeight-411-98-27)
             }

             //memberi kemungkinan kecil untuk berbalik arah
             if(Math.random() < 0.0025) this.velocity = -this.velocity  
                  
             this.Move()
             this.Framer()
             //merender ke canvas menggunakan ctx 2D
             ctx.drawImage(this.image[this.frame++], this.Position.X, this.Position.Y, this.width, this.height)
         }
     }
 }

 ////////BACKGROUND INTERAKTIF - bg terdiri dari tiga bagian: line, iron dan corridor
 const Background = {
     line: function () {
         this.width = 181
         this.height = 27
         this.image = ImageBackground.line

         this.Position = {
             X: 0,
             Y: screenHeight - 98 - this.height
         }

         this.Draw = () => {
             this.Position.X -= Player.velocity.X*3
             this.Position.Y = screenHeight - 91 - this.height

             //let do while dibawah berfungsi untuk infinity loop ke kanan dan ke kiri sesuai dengan pergeseran screen
             //ini untuk generate loop ke kanan
             
             let i = 0
             do ctx.drawImage(this.image, this.Position.X + this.width*i, this.Position.Y, this.width, this.height)
             while (i++*this.width + this.Position.X < screenWidth ) 

             //sedangkan ini untuk generate loop ke kiri
             let j = 0
             while (this.Position.X - this.width*j > 0) {
                 ctx.drawImage(this.image, this.Position.X - this.width*++j, this.Position.Y, this.width, this.height)
             }
         }
     },
     iron: function () {
         this.width = 1689
         this.height = 98
         this.image = ImageBackground.iron

         this.Position = {
             X: 0,
             Y: screenHeight - this.height
         }

         this.Draw = () => {
             this.Position.X -= Player.velocity.X
             this.Position.Y = screenHeight - this.height

             //let do while dibawah berfungsi untuk infinity loop ke kanan dan ke kiri sesuai dengan pergeseran screen
             //ini untuk generate loop ke kanan

             let i = 0
             do ctx.drawImage(this.image, this.Position.X + this.width*i, this.Position.Y, this.width, this.height)
             while (i++*this.width + this.Position.X < screenWidth ) 
             
             //sedangkan ini untuk generate loop ke kiri
             let j = 0
             while (this.Position.X - this.width*j > 0) {
                 ctx.drawImage(this.image, this.Position.X - this.width*++j, this.Position.Y, this.width, this.height)
             }
         }
     },
     corridor: function () {
         this.width = 1692.26
         this.height = 468
         this.image = ImageBackground.corridor

         this.Position = {
             X: 0,
             Y: 0
         }

         this.Draw = () => {
             this.Position.X -= Player.velocity.X*2

             //let do while dibawah berfungsi untuk infinity loop ke kanan dan ke kiri sesuai dengan pergeseran screen
             //ini untuk generate loop ke kanan


             let i = 0
             do ctx.drawImage(this.image, this.Position.X + this.width*i, this.Position.Y, this.width, this.height)
             while (i++*this.width + this.Position.X < screenWidth ) 
             
             //sedangkan ini untuk generate loop ke kiri
             let j = 0
             while (this.Position.X - this.width*j > 0) {
                 ctx.drawImage(this.image, this.Position.X - this.width*++j, this.Position.Y, this.width, this.height)
             }
         }
     },
     labelNama: function () {
         this.width = 375
         this.height = 120
         this.image = ImageBackground.labelNama

         this.Position = {
             X: 892,
             Y: 60
         }

         this.Draw = () => {
             this.Position.X -= Player.velocity.X*2.5

             ctx.drawImage(this.image, this.Position.X, this.Position.Y, this.width, this.height)
         }
     },
 }

 ////////INSTANSIASI SETIAP OBJEK (Player, Figur2, Background2)
 //Instansiasi player (yang coklat)
 const Player = new PlayerCharacter()

 //Instansiasi figur = karakter bergerak non player
 const Figur = {
     Polisi : new CharacterPasif('gray', 'left', 1000, 0),
     Raja : new CharacterPasif('yellow', 'right', 3500, 1),
     Terong : new CharacterPasif('purple', 'left', 3500, 0.5)
 }
 
 //Instansiasi background interaktif
 const BackgroundObjects = {
     line: new Background.line(),
     iron: new Background.iron(),
     corridor: new Background.corridor(),
     labelNama: new Background.labelNama()
 }

 
 //FUNGSI UTAMA - UPDATER UNTUK SCREEN (dieksekusi setiap interval 30ms)
 const FrameRunner = () => {
     //membersihkan canvas sebelumnya
     ctx.clearRect(0, 0, screenWidth, screenHeight)

     //merender ulang background
     BackgroundObjects.corridor.Draw()
     BackgroundObjects.iron.Draw()
     BackgroundObjects.line.Draw()
     BackgroundObjects.labelNama.Draw()

     //merender ulang figur2 dan player sesuai urutan Z-Axis nya
     //yg memiliki properti .lane atau .Position.Y paling bawah (terbesar) akan di render sebagai yg terdepat
     const figures = [Figur.Raja, Figur.Polisi, Figur.Terong, Player]
     figures.sort((a, b) => {return b.lane - a.lane})
     figures.forEach(figure => {
         figure.Draw()
     })
 }
 setInterval(FrameRunner, 30)


 /////////CONTROLLER - KEYBOARD EVENT HANDLER
 let isRightPressed = false
 let isLeftPressed = false
 let isUpPressed = false
 let isDownPressed = false

 //ketika ditekan (press down) jalankan ini
 const controlling = (e) => {
     if (e.which == 65 || e.which == 37){
         //GO LEFT 
         isLeftPressed = true
         Player.velocity.X = -5
     } else if (e.which == 68 || e.which == 39){
         //GO RIGHT
         isRightPressed = true
         Player.velocity.X = 5
     } else if (e.which == 38 || e.which == 87){
         //GO UP
         isUpPressed = true
         Player.velocity.Y = -5
     } else if (e.which == 40 || e.which == 83){
         //GO DOWN
         isDownPressed = true
         Player.velocity.Y = 5
     } 
 }
     
 //ketika jari diangkat jalankan ini
 const uncontrolling = (e) => {
     if (e.which == 65 || e.which == 37){
         //UN-GO LEFT 
         isLeftPressed = false
         if (isRightPressed) Player.velocity.X = 5
         else Player.velocity.X = 0

     } else if (e.which == 68 || e.which == 39){
         //UN-GO RIGHT
         isRightPressed = false
         if (isLeftPressed) Player.velocity.X = -5
         else Player.velocity.X = 0     

     } else if (e.which == 38 || e.which == 87){
         //UN-GO UP
         isUpPressed = false
         if (isDownPressed) Player.velocity.Y = 5
         else Player.velocity.Y = 0

     } else if (e.which == 40 || e.which == 83){
         //UN-GO DOWN
         isDownPressed = false
         if (isUpPressed) Player.velocity.Y = -5
         else Player.velocity.Y = 0           
     }
 }
 //menambah event listener pada ketikan keyboard
 document.addEventListener('keydown', controlling)
 document.addEventListener('keyup', uncontrolling)

 //MENHANDLE PERUBAHAN UKURAN SCREEN
 const reportWindowSize = () => {
     screenWidth = window.innerWidth
     screenHeight = window.innerHeight
     Canvas.width = screenWidth
     Canvas.height = screenHeight
     
     console.log(Player.Position.Y)
     console.log(screenHeight - Player.height - 129)
     if(Player.Position.Y > screenHeight - Player.height - 129 || Player.Position.Y < 411 - Player.height) {
         Player.Position.Y = screenHeight - Player.height - 129
     }
 }
 window.addEventListener('resize', reportWindowSize)