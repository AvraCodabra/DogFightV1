var set = {
    area : {
        width : 1000,
        height : 600,
        frames : 24,
        groundHeight : 25,
        color : "greay"
    },
    p : {
        v : 7,
        turn: Math.PI / 15,
        size : 30,
        bulletSize : 2,
        bulletSpeed: 2,
        startX : {
            x1 : 950,
            x2 : 580,
            x3 : 450,
            x4 : 70
        },
        startY : 563
    },
    rules : {
        ground : 1,
        stall : 1,
        stallBrake : 50, //frames
        maxlife: 5
    }
};

var frameCunter = 0;
var bullets = [];
var clouds = [];
var explotions = [];
var background = new Image();
background.src = "images/background.png";

function startGame() {
    reset = new Button(set.area.width - 45, 20, 40, 40, "images/buttons/reset.png");
    p1 = new Plane(set.p.startX.x1, set.p.startY, "images/planes/planeright.png", "images/planes/planeleft.png", "land", "L", set.p.startX.x1+25, set.p.startY);
    p2 = new Plane(set.p.startX.x2, set.p.startY, "images/planes/planeright2.png", "images/planes/planeleft2.png", "land", "R", set.p.startX.x2-55, set.p.startY);
    p3 = new Plane(set.p.startX.x3, set.p.startY, "images/planes/planeright3.png", "images/planes/planeleft3.png", "land", "L", set.p.startX.x3+35, set.p.startY);
    p4 = new Plane(set.p.startX.x4, set.p.startY, "images/planes/planeright4.png", "images/planes/planeleft4.png", "land", "R", set.p.startX.x4-55, set.p.startY);
    
    //יצירת עננים
    for ( i= 0; i< 4; i++) {
        c = new cloud();
        clouds[i] = c;
    }
    gameArea.start();
}
var gameArea = {
    canvas : document.createElement("canvas"),
    start : function () {
        this.canvas.width = set.area.width;
        this.canvas.height = set.area.height;
        this.context = this.canvas.getContext("2d");
        document.getElementById("game").appendChild(this.canvas);
        this.interval = setInterval(updateGameArea, set.area.frames);
        window.addEventListener('keydown', function (e) {
            gameArea.keys = (gameArea.keys || []);
            gameArea.keys[e.keyCode] = true;
        });
        window.addEventListener('keyup', function (e) {
            gameArea.keys[e.keyCode] = false;
        });
        window.addEventListener('mousedown', function (e) {
            gameArea.x = e.pageX;
            gameArea.y = e.pageY;
        });
        window.addEventListener('mouseup', function (e) {
            gameArea.x = false;
            gameArea.y = false;
        });
    },
    clear : function () {
        ctx = this.context;
        ctx.drawImage(background, 0, 0, set.area.width, set.area.height);
    },
    CheckGameOver : function () {
        if (p1.life+p2.life+p3.life+p4.life < 3*set.rules.maxlife) {
            var p = 0;
            if (p1.life<= 0 || (p1.life == set.rules.maxlife && p1.status === "land")) {p++};
            if (p2.life<= 0 || (p2.life == set.rules.maxlife && p2.status === "land")) {p++};
            if (p3.life<= 0 || (p3.life == set.rules.maxlife && p3.status === "land")) {p++};
            if (p4.life<= 0 || (p4.life == set.rules.maxlife && p4.status === "land")) {p++};
            if (p == 3) {
                var win;
                switch (true) {
                    case p1.playing : win = 'Red';
                        break;
                    case p2.playing : win = 'Blue';
                        break;
                    case p3.playing : win = 'green';
                        break;
                    case p4.playing : win = 'purpel';
                        break;
                         }
                ctx = this.context;
                ctx.font = "100px Aharoni";
                ctx.fillStyle = win;
                ctx.textAlign= "center";
                ctx.fillText(win+" Wins!", set.area.width/2, set.area.height/2);

           }
        }
        if ((p1.playing || p2.playing || p3.playing || p4.playing) == false){
            ctx = this.context;
            ctx.save();
            ctx.font = "100px Aharoni";
            ctx.shadowBlur=20;
            ctx.shadowColor="black";
            ctx.fillStyle = "white";
            ctx.textAlign= "center";
            ctx.fillText("Dog Fight Vol.09", set.area.width/2, set.area.height/2);  
            ctx.restore();
        }
    },
    restart : function () {
        p1.status="land"; p1.playing= false;
        p2.status="land"; p2.playing= false;
        p3.status="land"; p3.playing= false;
        p4.status="land"; p4.playing= false;
        p1.life=set.rules.maxlife;
        p2.life=set.rules.maxlife;
        p3.life=set.rules.maxlife;
        p4.life=set.rules.maxlife;
    }
};

function Button (x, y, width, height, src){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;  
    this.left = this.x;
    this.right = this.x + (this.width);
    this.top = this.y;
    this.bottom = this.y + (this.height);
    this.image = new Image();
    this.image.src = src;
    this.update = function() {
        ctx = gameArea.context;
        ctx.drawImage(this.image, this.x , this.y, this.width, this.height);
    }
    this.clicked = function() { 
        var clicked = true;
        if ((this.bottom < gameArea.y) || (this.top > gameArea.y) || (this.right < gameArea.x) || (this.left > gameArea.x)) {
            clicked = false;
        }
        return clicked;
    }
    this.checkPress = function () {
        if (gameArea.x && gameArea.y) {
        if (this.clicked()) {
            gameArea.restart();
            }
        }
    }

}

function Plane(x, y , srcR, srcL, status, side, lx, ly) {
    this.playing = false;
    this.life = set.rules.maxlife;
    this.status = status; //alive, dead, stall, land, takeOff, falling
    this.side = side;
    this.width = set.p.size;
    this.height = set.p.size;
    this.x = x;
    this.y = y;
    this.lx = lx;
    this.ly = ly;
    this.image = new Image();
    this.control = function (p) {
        switch (this.status) {
            case "alive" :
                switch (p) {
                    case "left" : 
                        this.angle-=set.p.turn;
                        break;
                    case "right" : 
                        this.angle+=set.p.turn;
                        break;
                    case "shoot" : 
                        this.shoot();
                        break;
                         }
                break;
             case "land" :
                    if (p == "shoot") {this.shoot()};
                break;
        }
         
    }
    this.update = function () {
    ctx = gameArea.context; 
	//draw score
		ctx.save();
		ctx.font = "30px Arial";
		ctx.fillStyle = "white"
		ctx.fillText(this.life ,this.lx,this.ly);
		ctx.restore();
            
            if (set.rules.ground==1) {if (this.y>(set.area.height-set.area.groundHeight)) {this.hit(-1, this.x, this.y)}}; //התנגשות בקרקע
        if (this.status === "alive") {
        //draw plane
            if (this.angle>(2 * Math.PI)) {this.angle -= (2 * Math.PI)};
            if (Math.cos(this.angle)>0) {this.image.src = srcR;};
            if (Math.cos(this.angle)<0) {this.image.src = srcL;};
            ctx.save();
            ctx.translate(this.x, this.y); 
            ctx.rotate(this.angle);
            ctx.drawImage(this.image, this.width / -2, this.height / -2, this.width, this.height);
            ctx.restore();
        //התקדמות
            this.x = this.x + (this.velocity * Math.cos(this.angle));
            this.y = this.y + (this.velocity * Math.sin(this.angle));
        //תאוצה
            if (Math.sin(this.angle)>0) {this.velocity += (Math.sin(this.angle)*0.1);}
            if (Math.sin(this.angle)<-0.5) {this.velocity += (Math.sin(this.angle)*0.08);}
            if ((Math.sin(this.angle)<0) && (Math.sin(this.angle)>-0.5) && (this.velocity<set.p.v)) {this.velocity*=1.05}
        //קצוות
            if (this.x<0) {this.x=set.area.width};
            if (this.x>set.area.width) {this.x=0};
        //הזדקרות
            if ((this.status === "alive") && (set.rules.stall==1) && (this.y<-this.width/2 || this.velocity<2)){
                    this.status="stall";
                    this.stallAngle=this.angle
                    this.frame =0;
            };
        }
        if (this.status === "stall") {
            this.frame++;
            //נפילה
            this.velocity = set.p.v;
            ctx.save();
            ctx.translate(this.x, this.y); 
            ctx.rotate((this.stallAngle++)/2);
            ctx.drawImage(this.image, this.width / -2, this.height / -2, this.width, this.height);
            ctx.restore();
            this.y = this.y + this.velocity;
            //היחלצות
            if (this.frame > set.rules.stallBrake) {
                this.angle = Math.PI/2;
                this.status = "alive";    
            }
        }
        if (this.status === "land") {
            this.y = set.p.startY;
            this.x = x;
            ctx.save();
            ctx.translate(this.x, this.y); 
            if (this.side=="L") {
                this.image.src = srcL;
                this.angle = Math.PI;
                ctx.rotate(Math.PI*(5/4));
                ctx.drawImage(this.image, this.width / -2, this.height / -2, this.width, this.height);
            };
            if (this.side=="R") {
                this.image.src =srcR;
                this.angle = 0;
                ctx.rotate(-Math.PI/4);
                ctx.drawImage(this.image, this.width / -2, this.height / -2, this.width, this.height);
            }
            ctx.restore();
            this.velocity = 1;
        }
        if (this.status === "takeOff") {
            this.playing = true;
            this.velocity+=0.1
            ctx.save();
            ctx.translate(this.x, this.y); 
            if (this.side=="R") {
                ctx.rotate(-Math.PI/(4*this.velocity));
                ctx.drawImage(this.image, this.width / -2, this.height / -2, this.width, this.height);
                this.x = this.x + (this.velocity * Math.cos(0));
            }
              if (this.side=="L") {
                ctx.rotate(Math.PI+Math.PI/(4*this.velocity));
                ctx.drawImage(this.image, this.width / -2, this.height / -2, this.width, this.height);
                this.x = this.x + (this.velocity * Math.cos(Math.PI));
            }
            ctx.restore();
            if (this.velocity >5) {this.status="alive"};
        }
        if (this.status === "falling") {}
        
    };
    
    this.shoot = function () {
        if (this.status === "alive") {
            b = new Bullet(this.x+(this.velocity+15+this.width/2)*Math.cos(this.angle), this.y+(this.velocity+15+this.height/2)*Math.sin(this.angle), this.velocity+set.p.bulletSpeed, this.angle);
            bullets.push(b);
        }
        if (this.status === "land") {this.status = "takeOff"}   
    };
    
    this.checkHit = function () {
        if ((this.status != "dead") && (this.status != "land")) {
            for (i=0; i<bullets.length; i++) {
                if (((this.y+(this.height/2)>bullets[i].y) && (this.y-(this.height/2)<bullets[i].y)) && ((this.x+(this.width/2)>bullets[i].x) && (this.x-(this.width/2)<bullets[i].x))) {
                    this.hit(i, this.x, this.y);
                };
            };
        }
        if (this.life<=0) {
            this.status = "dead";
            this.playing = false;
        };
    };
    this.hit = function (i, x, y) {
        e = new Explotion (x, y, set.p.size+10, set.p.size+10 ,"images/explosion.png", 23);
        explotions.push(e);
        if (i!=-1)  {bullets.splice(i, 1)}
        this.life--;
        this.status = "land";
    };
}

function Explotion (x, y, width, height ,src, frames) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = new Image();
    this.image.src = src;
    this.frames = frames;
    this.frame = 0 ;
    this.sx = this.sy = 0;
    this.size = this.image.width/5;
    this.sw = this.sh = this.size;
    this.update = function () {
        ctx = gameArea.context;
        ctx.save();
        ctx.translate(this.x-this.width/2, this.y-this.height/2); 
        ctx.drawImage(this.image, this.sx, this.sy, this.size, this.size, 0, 0, this.width, this.height);
        ctx.restore();
        this.frame++;
        this.sx = this.size*(this.frame%5);
        this.sy = this.size*Math.floor(this.frame/5); 
    } 
}

function Bullet(x, y, v, angle) {
    this.angle = angle;
    this.x = x;
    this.y = y;
    this.velocity = v;
    this.update = function () {
        this.x = this.x + (this.velocity * Math.cos(this.angle));
        this.y = this.y + (this.velocity * Math.sin(this.angle));
        ctx = gameArea.context;
        ctx.lineWidth=10;
        ctx.fillStyle= "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x, this.y,set.p.bulletSize,0,2*Math.PI);
        ctx.fill();  
    }; 
    
}
/*
function LifeBar(x,y) {
    this.x = x;
    this.y = y;
    this.life= set.rules.maxlife;
    
    this.downBar = function () {
        this.life--;
    }
    this.reset = function () {
        this.life= set.rules.maxlife;
    }
    this.update = function() {
        var ctx = gameArea.context
        ctx.font = "30px Arial";
        ctx.fillStyle = "white"
        ctx.fillText(this.life ,this.x,this.y);
    }
    */

function cloud (x) {
    if (x=="new") {
        this.x=-160;
    } else this.x = Math.floor(Math.random()*set.area.width);
    this.y = Math.floor(Math.random()*(set.area.height/3));
    this.v = Math.random()*0.8;
    this.p = Math.floor(Math.random()*4)+1;
    this.update = function () {
        this.x+= this.v;
        ctx = gameArea.context;
        image = new Image();
        image.src = "images/clouds/cloud"+this.p+".png";
        ctx.drawImage(image, this.x , this.y);
    }
}

function updateGameArea() {
    frameCunter++;
    gameArea.clear();
    reset.checkPress();
    //back clouds
    for (i=0; i<clouds.length; i++) {
        if (i%2==0) {clouds[i].update()}
        if (clouds[i].x>set.area.width) {clouds.splice(i, 1)}
    };
    p1.update();
    p2.update();
    p3.update();
    p4.update();
    p1.checkHit();
    p2.checkHit();
    p3.checkHit();
    p4.checkHit();
     //Bullets & explotions
    for (i=0; i<bullets.length; i++) {
        bullets[i].update()
        if (bullets[i].x>set.area.width || bullets[i].x<0 || bullets[i].y>set.area.height || bullets[i].y<0 ) {
            bullets.splice(i, 1);
        }
    };
    for (i=0; i<explotions.length; i++) {
        explotions[i].update()
        if (explotions[i].frame > explotions[i].frames) {explotions.shift()}
    };
    //front clouds
    for (i=0; i<clouds.length; i++) {
        if (i&2!=0) {clouds[i].update()} 
    };
    if (frameCunter%100 == 0) {c = new cloud("new"); clouds.push(c);}
      //move p1
    if (gameArea.keys && gameArea.keys[39]) {p1.control("right")};
    if (gameArea.keys && gameArea.keys[37]) {p1.control("left")};//leftarrow
    if (gameArea.keys && gameArea.keys[40]) {if (s1 == true) {p1.control("shoot"); s1=false};} else {s1=true};
       //move p2
    if (gameArea.keys && gameArea.keys[186]) {p2.control("right")};
    if (gameArea.keys && gameArea.keys[75]) {p2.control("left")};//leftarrow
    if (gameArea.keys && gameArea.keys[76]) {if (s2 == true) {p2.control("shoot"); s2=false};} else {s2=true};
       //move p3
    if (gameArea.keys && gameArea.keys[71]) {p3.control("right")};
    if (gameArea.keys && gameArea.keys[68]) {p3.control("left")};//leftarrow
    if (gameArea.keys && gameArea.keys[70]) {if (s3 == true) {p3.control("shoot"); s3=false};} else {s3=true};
       //move p4
    if (gameArea.keys && gameArea.keys[51]) {p4.control("right")};
    if (gameArea.keys && gameArea.keys[49]) {p4.control("left")};//leftarrow
    if (gameArea.keys && gameArea.keys[50]) {if (s4 == true) {p4.control("shoot"); s4=false};} else {s4=true};
    
    gameArea.CheckGameOver();
    reset.update(); //reset button
    //console.log(explotions.length);
    

}

/*
to do
סג"מ
התנגשות
*/