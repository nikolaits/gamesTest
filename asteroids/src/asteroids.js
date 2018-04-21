var Asteroids = {
};

var game;
var platform_tools;
var user_data;
var gameID = 2;
var g_score;
var assets_path=""

function start_asteroids(windowwidth, windowheight, container, args, assetsPath, callback) {
    platform_tools = callback;
    assets_path = assetsPath;
    // args - level, username, mode, 3 objects with 3 games(id and names)
    user_data = args;

    game = new Phaser.Game(windowwidth, windowheight, Phaser.CANVAS, container);


    game.state.add('Preloader', Asteroids.Preloader);
    game.state.add('Menu', Asteroids.MainMenu);
    game.state.add('Game', Asteroids.Game);
    game.state.add("GameOver", Asteroids.GameOver);

    game.state.start('Preloader');

}

function destroy_asteroids(){
    // console.log("destroy_asteroids");
    // game.state.remove('Preloader');
    // game.state.remove('Menu');
    // game.state.remove('Game');
    // game.state.remove('GameOver');
    game.destroy();
    // Asteroids.Preloader = null;
    document.getElementById("asteroid").remove();

}
 





Asteroids.Preloader = function () { };

Asteroids.Preloader.prototype = {

    init: function () {

    },

    preload: function () {
        //  this.load.path = 'assets/games/asteroids/assets/sprites/';
        this.game.load.image("asteroid", assets_path+"assets/sprites/asteroid.png");
         this.game.load.image("asteroid2", assets_path+"assets/sprites/asteroid2.png");
         this.game.load.image("earth", assets_path+"assets/sprites/earth.png");
         this.game.load.image("live", assets_path+"assets/sprites/live.png");
         this.game.load.image("menu_bc", assets_path+"assets/sprites/menu_bc.png");
         this.game.load.image("projectile", assets_path+"assets/sprites/projectile.png");
         this.game.load.image("ship", assets_path+"assets/sprites/ship.png");
         this.game.load.image("space", assets_path+"assets/sprites/space.png");
         this.game.load.image("start", assets_path+"assets/sprites/start.png");
         this.game.canvas.id = 'asteroid';

        // this.load.images(['ship', 'projectile', 'asteroid', 'asteroid2', 'earth', 'space', 'live', 'start', 'menu_bc']);

    },

    create: function () {
        // start next state.
        console.log("State : Preload");
        this.state.start('Menu');
    }
};

Asteroids.MainMenu = function () { };

Asteroids.MainMenu.prototype = {
    create: function () {
        console.log("State : Menu");

        var background = this.add.sprite(0, 0, 'menu_bc');
        background.height = this.world.height;
        background.width = this.world.width;

        this.start_button = this.add.sprite(this.world.centerX, this.world.centerY + 200, 'start');
        this.start_button.anchor.setTo(0.5);
        this.start_button.inputEnabled = true;
        this.start_button.events.onInputDown.add(this.start, this);
        var tween2 = this.add.tween(this.start_button.scale).to({x: 0.8, y: 0.8},1000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    },

    start: function () {
        this.state.start("Game", true, false, 100, 10, 0, 3);
    }
};

Asteroids.Game = function (game) {
    this.Debug = false;
    this.NumberAsteroids;
    this.maxAsteroids;
    this.Level;
    this.score;
};

Asteroids.Game.prototype = {
    init: function (lvl, maxA, score, lives) {
        console.log("State : Game");
        this.Level = lvl;
        this.maxAsteroids = maxA;
        this.score = score;
        this.NumberAsteroids = 0;
        this.Lives = lives

        var background = this.add.sprite(0, 0, 'space');
        background.height = this.world.height;
        background.width = this.world.width;

        this.physics.startSystem(Phaser.Physics.P2JS);
        this.physics.p2.setImpactEvents(true);
        this.world.bounds.setTo(0, 0, 440, 600);
        this.physics.setBoundsToWorld();

        this.InitShip();
        this.InitAsteroids();

        this.earthCollisionGroup = this.physics.p2.createCollisionGroup();
        this.earth = this.add.sprite(this.world.centerX, this.game.height + 20, 'earth');
        this.earth.anchor.setTo(0.5, 0.5);
        this.earth.scale.setTo(0.5);

        this.physics.p2.enable(this.earth, this.Debug);
        this.earth.body.setCircle(90);
        this.earth.body.collideWorldBounds = true;
        this.earth.body.fixedRotation = true;
        this.earth.body.setCollisionGroup(this.earthCollisionGroup);
        this.earth.body.collides(this.asteroidsCollisionGroup, this.DestroyShip, this);
        this.earth.body.collides(this.asteroids2CollisionGroup, this.DestroyShip, this);
    },

    create: function () {
        this.txtScore = this.game.add.text(10, 10, "Score: " + this.score, { font: "15px Fjalla One", fill: "#FF0000" });
        this.txtNumberAsteroids = this.game.add.text(100, 10, "Asteroids left: " + (this.maxAsteroids - this.NumberAsteroids), { font: "15px Fjalla One", fill: "#FF0000" });
        this.txtLVL = this.game.add.text(250, 10, "Level: " + this.Level, { font: "15px Fjalla One", fill: "#FF0000" });

        this.CreateShip();
        this.CreateAsteroids();
    },

    update: function () {
        this.UpdateShip();
        this.UpdateAsteroids();
    },

    render: function () {
        /* game.debug.text('Active Projectiles: ' + this.Projectiles.total + ' / ' + this.Projectiles.countLiving(), 32, 32);
         game.debug.text('Active Asteroids: ' + this.Asteroids.total + ' / ' + this.Asteroids.countLiving(), 32, 50);
         game.debug.text('LVL: ' +this.frequency, 32, 70);
         game.debug.text('MAX: ' + (this.maxAsteroids - this.NumberAsteroids), 32, 90);
         this.Asteroids.forEachAlive(this.renderGroup,this);
         this.Asteroids2.forEachAlive(this.renderGroup,this);*/
    },

    renderGroup: function (member) {
        game.debug.body(member);
    },
    /// Ship methods ///
    InitShip: function () {
        this.ship;
        this.shipCollisionGroup = this.physics.p2.createCollisionGroup();
        this.Lives;
        this.speed;
        this.fireRate = 450;
        this.nextFire = 0;
        this.dmg = 50;
        this.livesGroup = this.add.group();

        this.InitProjectiles();
    },

    CreateShip: function () {
        this.ship = this.add.sprite(220, 520, 'ship');
        this.ship.smoothed = false;
        this.ship.scale.setTo(0.1);

        this.physics.p2.enable(this.ship, this.Debug);
        this.ship.body.setCircle(15);
        this.ship.body.collideWorldBounds = true;
        this.ship.body.fixedRotation = true;

        this.ship.body.setCollisionGroup(this.shipCollisionGroup);
        this.ship.body.collides(this.asteroidsCollisionGroup, this.DestroyShip, this);
        this.ship.body.collides(this.asteroids2CollisionGroup, this.DestroyShip, this);

        for (var i = 0; i < this.Lives; i++) {
            var tmp = this.livesGroup.create((this.world.width - 20) - (i * 22), 20, 'live');
            tmp.name = i;
            tmp.scale.setTo(0.05);
            tmp.anchor.setTo(0.5);
        }

        this.CreateProjectiles();
    },

    DestroyShip: function (s, a) {
        a.x = -200;
        s.x = -200;
        if (this.Lives - 1 < 0) {
            g_score=this.score;
            this.state.start('GameOver');
        } else {
            this.state.restart(true, false, this.Level, this.maxAsteroids, this.score, this.Lives - 1);
        }
    },

    UpdateShip: function () {
        this.ship.body.setZeroVelocity();

        if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.ShipShoot();
        }

        if (this.input.keyboard.isDown(Phaser.Keyboard.A) || this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.ship.body.velocity.x = -150;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.D) || this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.ship.body.velocity.x = 150;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.W) || this.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            this.ship.body.velocity.y = -150;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.S) || this.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.ship.body.velocity.y = 150;
        }
    },

    ShipShoot: function () {
        if (this.time.now > this.nextFire) {
            this.nextFire = this.time.now + this.fireRate;
            var tmp = this.Projectiles.getFirstExists(false);
            if (tmp) {
                tmp.reset(this.ship.x, this.ship.y - 8);
                tmp.body.velocity.y = -400;
            }
        }
    },

    InitProjectiles: function () {
        this.projSpeed;
        this.Projectiles = this.add.group();
        this.projectilesCollisionGroup = this.physics.p2.createCollisionGroup()
    },

    CreateProjectiles: function () {
        this.Projectiles.enableBody = true;
        this.Projectiles.physicsBodyType = Phaser.Physics.P2JS;

        for (var i = 0; i < 25; i++) {
            var tmp = this.Projectiles.create(this.ship.x, this.ship.y, 'projectile');
            this.physics.p2.enable(tmp, this.Debug);

            tmp.name = 'projectile ' + i;
            tmp.anchor.setTo(0.5, 0.5);
            tmp.checkWorldBounds = true;
            tmp.visible = false;
            tmp.exists = false;

            tmp.body.setCircle(8);
            tmp.body.kinematic = true;
            tmp.events.onOutOfBounds.add(this.KillProjectile, this);

            tmp.body.setCollisionGroup(this.projectilesCollisionGroup);
            tmp.body.collides(this.asteroidsCollisionGroup, this.HitAsteroid, this);
            tmp.body.collides(this.asteroids2CollisionGroup, this.HitAsteroid2, this);
        }
    },

    KillProjectile: function (proj) {
        proj.kill();
    },

    HitAsteroid: function (p, a) {
        a.x = -200;
        p.x = -200;
        this.score += 2;
        this.NumberAsteroids++;
        this.txtNumberAsteroids.setText("Asteroids left: " + (this.maxAsteroids - this.NumberAsteroids));
        this.txtScore.setText("Score: " + this.score);

        if (this.NumberAsteroids >= this.maxAsteroids) {
            this.state.restart(true, false, this.Level + 1, this.maxAsteroids + 10, this.score, this.Lives)
        }
    },

    HitAsteroid2: function (p, a) {
        this.AsteroidHP[a.sprite.name] -= this.dmg;
        p.x = -200;
        if (this.AsteroidHP[a.sprite.name] <= 0) {
            this.AsteroidHP[a.sprite.name] = 100;
            a.x = -200;
            this.score += 3;
            this.NumberAsteroids++;
            this.txtNumberAsteroids.setText("Asteroids left: " + (this.maxAsteroids - this.NumberAsteroids));
            this.txtScore.setText("Score: " + this.score);

            if (this.NumberAsteroids >= this.maxAsteroids) {
                this.state.restart(true, false, this.Level + 1, this.maxAsteroids + 10, this.score, this.Lives)
            }
        }
    },

    /// Asteroids ///
    InitAsteroids: function () {
        this.Asteroids = this.add.group();
        this.Asteroids2 = this.add.group();
        this.asteroidsCollisionGroup = game.physics.p2.createCollisionGroup();
        this.asteroids2CollisionGroup = game.physics.p2.createCollisionGroup();
        this.asSpeed;
        this.frequency = 2000 - (this.Level * 60);
        if (this.frequency < 900) {
            this.frequency = 900;
        }
        this.nextAsteroid = this.frequency;
        this.nextAsteroid2 = 5000 - (this.Level * 20);
        if (this.nextAsteroid2 < 2000) {
            this.nextAsteroid2 = 2000;
        }
        this.AsteroidHP = {};
    },

    CreateAsteroids: function () {
        this.Asteroids.enableBody = true;
        this.Asteroids2.enableBody = true;

        this.Asteroids.physicsBodyType = Phaser.Physics.P2JS;
        for (var i = 0; i < 40; i++) {
            var tmp = this.Asteroids.create(0, 0, 'asteroid');
            this.physics.p2.enable(tmp, this.Debug);

            tmp.name = 'Asteroid' + i;
            tmp.anchor.setTo(0.5, 0.5);
            tmp.scale.setTo(0.1);
            tmp.checkWorldBounds = true;
            tmp.visible = false;
            tmp.exists = false;

            tmp.body.setCircle(15);
            tmp.events.onOutOfBounds.add(this.KillProjectile, this);
            tmp.body.rotateRight(100);

            tmp.body.setCollisionGroup(this.asteroidsCollisionGroup);
            tmp.body.collides([this.asteroidsCollisionGroup, this.projectilesCollisionGroup, this.shipCollisionGroup, this.earthCollisionGroup]);
        }

        this.Asteroids2.physicsBodyType = Phaser.Physics.P2JS;
        for (var i = 0; i < 25; i++) {
            var tmp2 = this.Asteroids2.create(0, 0, 'asteroid2');
            this.physics.p2.enable(tmp2, this.Debug);

            tmp2.name = 'AsteroidRED' + i;
            this.AsteroidHP[tmp2.name] = 100;
            tmp2.anchor.setTo(0.5, 0.5);
            tmp2.scale.setTo(0.2);
            tmp2.checkWorldBounds = true;
            tmp2.visible = false;
            tmp2.exists = false;

            tmp2.body.setCircle(10);
            tmp2.events.onOutOfBounds.add(this.KillProjectile, this);

            tmp2.body.setCollisionGroup(this.asteroids2CollisionGroup);
            tmp2.body.collides([this.asteroids2CollisionGroup, this.projectilesCollisionGroup, this.shipCollisionGroup, this.earthCollisionGroup]);
        }
    },

    HitPlanet: function (a) {
        if (this.Lives - 1 < 0) {
            g_score= this.score;
            this.state.start('GameOver');
        } else {
            this.state.restart(true, false, this.Level, this.maxAsteroids, this.score, this.Lives - 1);
        }
    },

    GenerateAsteroids: function () {
        if (this.time.now > this.nextAsteroid) {
            this.nextAsteroid = this.time.now + this.frequency;
            var tmp = this.Asteroids.getFirstExists(false);
            if (tmp) {
                var randomX = this.rnd.integerInRange(0, 400);
                tmp.reset(randomX, 0);
            }
        }

        if (this.time.now > this.nextAsteroid2) {
            this.nextAsteroid2 = this.time.now + 5000;
            var tmp2 = this.Asteroids2.getFirstExists(false);
            if (tmp2) {
                randomX = this.rnd.integerInRange(0, 400);
                tmp2.reset(randomX, 0);
            }
        }
    },

    MoveAsteroids: function () {
        this.Asteroids.forEachAlive(function (a) {
            var dx = 220 - a.x;
            var dy = 720 - a.y;
            var bulletRotation = Math.atan2(dy, dx);
            a.body.rotation = bulletRotation + game.math.degToRad(-90);
            var angle = a.body.rotation + (Math.PI / 2);
            a.body.velocity.x = 100 * Math.cos(angle);
            a.body.velocity.y = 100 * Math.sin(angle);
        }, this);

        this.Asteroids2.forEachAlive(function (a) {
            var dx = 220 - a.x;
            var dy = 720 - a.y;
            var bulletRotation = Math.atan2(dy, dx);
            a.body.rotation = bulletRotation + game.math.degToRad(-90);
            var angle = a.body.rotation + (Math.PI / 2);
            a.body.velocity.x = 100 * Math.cos(angle);
            a.body.velocity.y = 100 * Math.sin(angle);
        }, this);

    },

    UpdateAsteroids: function () {
        this.GenerateAsteroids()
        this.MoveAsteroids();
    },

};

Asteroids.GameOver = function () { };

Asteroids.GameOver.prototype = {
    create: function () {
        console.log("State : GameOver")
        document.getElementById("asteroid").remove();
        console.log("project score");
        console.log(g_score);
        
        if( g_score >= 20)
        {
            platform_tools("GameOver", g_score, 0, gameID, null, true);
        }else{
            
            platform_tools("GameOver", g_score, 0, gameID, null, false);
        }
        
    },

    start: function () {
    }
};