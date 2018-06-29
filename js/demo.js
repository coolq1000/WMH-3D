
class Engine
{

    constructor(toLoad)
    {
        /// Initialization,
        
        // Variable initializaion,
        this.FPS     =    60;
        this.FOV     =    75;
        this.NEAR    = 0.001;
        this.FAR     = 10000;
        this.TICK    =     0;
        this.SCALE   =  0.01;
        this.WIDTH   = window.innerWidth;
        this.HEIGHT  = window.innerHeight;
        this.EXPLOAD =   10.0;

        // Object initialization,
        this.gui       = this.initGUI      ();
        this.scene     = this.initScene    ();
        this.clock     = this.initClock    ();
        this.loader    = this.initLoader   ();
        this.camera    = this.initCamera   ();
        this.lights    = this.initLights   ();
        this.controls  = this.initControls ();
        this.raycaster = this.initRaycaster();
        this.renderer  = this.initRenderer ();

        // Resize listener,
        window.addEventListener('resize', this.resize.bind(this));

        // GUI options,
        this.options = {
            'Expload': this.doExpload.bind(this),
            'Unexpload': this.doUnexpload.bind(this)
        }

        this.gui.add(this.options, 'Expload');
        this.gui.add(this.options, 'Unexpload');

        // Run init function before start,
        this.worldcenter = new THREE.Vector3(0, 0, 0);
        this.init(toLoad);
        this.userdata  = this.initUserData ();

        // Start cycle,
        setInterval(
            this.cycle.bind(this),
            1000 / this.FPS
        );
    }

    initGUI()
    {
        return new dat.GUI();
    }

    initScene()
    {
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);
        return scene;
    }

    initClock()
    {
        var clock = new THREE.Clock();
        clock.start();
        return clock;
    }

    initLoader()
    {
        return new THREE.OBJLoader2();
    }

    initCamera()
    {
        return new THREE.PerspectiveCamera(
            this.FOV,
            window.innerWidth / window.innerHeight,
            this.NEAR,
            this.FAR
        )
    }

    initLights()
    {
        var ambient = new THREE.AmbientLight(
            0x111111
        );
        this.scene.add(ambient);

        this.viewlight = new THREE.DirectionalLight(
            0x444444,
            2
        );
        this.scene.add(this.viewlight);
    }

    initUserData()
    {
        var userdata = {};
        for (var i = 0; i < this.scene.children.length; i++)
        {
            var child = this.scene.children[i];
            userdata[child.uuid] = {}
            userdata[child.uuid].originalPosition = child.position;
        }
        return userdata;
    }

    initControls()
    {
        this.mouse = new THREE.Vector2();
        window.document.addEventListener('keypress', this.key.bind(this));
        document.addEventListener('mousemove', this.click.bind(this), false);
        document.addEventListener('touchdown', this.click.bind(this), false);
        var controls = new THREE.OrbitControls(this.camera);
        controls.enableDamping = true;
        controls.dampingFactor = 0.2;
        controls.rotateSpeed = 0.2;
        return controls;
    }

    initRaycaster()
    {
        return new THREE.Raycaster();
    }

    initRenderer()
    {
        var renderer = new THREE.WebGLRenderer({
            'antialias': true,
            'logarithmicDepthBuffer': true
        });
        renderer.setSize(this.WIDTH, this.HEIGHT);
        document.body.appendChild(renderer.domElement);
        return renderer;
    }

    getCentroid()
    {
        var scope = this;

        var center = new THREE.Vector3(0, 0, 0);
        this.scene.traverse(function (node) {
            if (node.geometry != undefined)
            {
                center.add(scope.getCenter(node));
            }
        });
        return center.normalize();
    }

    getCenter(node)
    {
        node.geometry.computeBoundingSphere();
        return node.geometry.boundingSphere.center;
    }

    getCenters(node)
    {
        var scope = this;

        var center = new THREE.Vector3(0, 0, 0);
        node.traverse(function (node) {
            if (node.geometry != undefined)
            {
                center.add(scope.getCenter(node));
            }
        });
        return center.normalize();
    }

    resize()
    {
        this.WIDTH = window.innerWidth;
        this.HEIGHT = window.innerHeight;
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.camera.aspect = this.WIDTH / this.HEIGHT;
        this.camera.updateProjectionMatrix();
    }

    expload(mesh,)
    {
        var center = this.worldcenter;
        var position = this.getCenter(mesh).normalize();
        var normalized = new THREE.Vector3(position.x - center.x, position.y - center.y, position.z - center.z).normalize();
        if (mesh instanceof THREE.Mesh)
        {
            mesh.position.x = mesh.position.x + (normalized.x * (this.EXPLOAD / this.SCALE));
            mesh.position.y = mesh.position.y + (normalized.y * (this.EXPLOAD / this.SCALE));
            mesh.position.z = mesh.position.z + (normalized.z * (this.EXPLOAD / this.SCALE));
        }
        else
        {
            mesh.position.x = mesh.position.x + (normalized.x * this.EXPLOAD);
            mesh.position.y = mesh.position.y + (normalized.y * this.EXPLOAD);
            mesh.position.z = mesh.position.z + (normalized.z * this.EXPLOAD);
        }
    }

    unexpload(mesh)
    {
        if (Math.abs(mesh.position.x) <= 0.00000000001 && Math.abs(mesh.position.y) <= 0.00000000001 && Math.abs(mesh.position.z) <= 0.00000000001)
        {
            mesh.position.set(0, 0, 0);
            return;
        }
        var center = this.worldcenter;
        var position = this.getCenter(mesh).normalize();
        var normalized = new THREE.Vector3(position.x - center.x, position.y - center.y, position.z - center.z).normalize();
        if (mesh instanceof THREE.Mesh)
        {
            mesh.position.x = mesh.position.x - (normalized.x * (this.EXPLOAD / this.SCALE));
            mesh.position.y = mesh.position.y - (normalized.y * (this.EXPLOAD / this.SCALE));
            mesh.position.z = mesh.position.z - (normalized.z * (this.EXPLOAD / this.SCALE));
        }
        else
        {
            mesh.position.x = mesh.position.x - (normalized.x * this.EXPLOAD);
            mesh.position.y = mesh.position.y - (normalized.y * this.EXPLOAD);
            mesh.position.z = mesh.position.z - (normalized.z * this.EXPLOAD);
        }
    }

    doExpload()
    {
        var scope = this;
        this.scene.traverse(function(node) {
            if (node.geometry != undefined) {
                scope.expload(node);
            }
        });
    }

    doUnexpload()
    {
        var scope = this;
        this.scene.traverse(function(node) {
            if (node.geometry != undefined) {
                scope.unexpload(node);
            }
        });
    }

    key(event)
    {
        event.preventDefault();
        if (event.key == 'x')
        {
            this.doExpload();
        }
        else if (event.key == 's')
        {
            this.doUnexpload();
        }
        else if (event.key == 'g')
        {
            this.scene.updateMatrixWorld(true);
            var dotGeometry = new THREE.Geometry();
            for (var x = 0; x < window.innerWidth; x+= 4)
            {
                for (var y = 0; y < window.innerHeight; y+=4)
                {
                    //this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    //this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                    this.mouse.x = (x / window.innerWidth) * 2 - 1
                    this.mouse.y = -(y / window.innerHeight) * 2 + 1

                    var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);

                    vector.unproject(this.camera);

                    this.raycaster.setFromCamera(this.mouse, this.camera);
                    //this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());

                    var intersects = this.raycaster.intersectObjects(this.scene.children, true);

                    for (var i = 0; i < intersects.length; i++)
                    {
                        var inter = intersects[i];
                        dotGeometry.vertices.push(inter.point);
                        break;
                    }
                }
            }
            var dotMaterial = new THREE.PointsMaterial( { size: 4, sizeAttenuation: false } );
            var dot = new THREE.Points( dotGeometry, dotMaterial );
            this.scene.add( dot );
        }
    }

    click(event)
    {
        

        // var scope = this;
        // this.scene.traverse(function(node) {
        //     var intersects = scope.raycaster.intersectObjects(node.children, true);

        //     for (var i = 0; i < intersects.length; i++)
        //     {
        //         intersects[i].object.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        //     }
        // });

        // var dotGeometry = new THREE.Geometry();
        // for (var i = 0; i < hit.length; i++)
        // {
        //     dotGeometry.vertices.push(hit[i].point);
        //     console.log(hit[i].point);
        // }
        // var dotMaterial = new THREE.PointsMaterial( { size: 4, sizeAttenuation: false } );
        // var dot = new THREE.Points( dotGeometry, dotMaterial );
        // this.scene.add( dot );
    }

    init(toLoad)
    {
        this.renderer.setPixelRatio( window.devicePixelRatio * 1.0 );
        // Create object,
        this.loader.setPath('objs/')
        /*this.loader.loadMtl('lamborghini-aventador.mtl', null, function(materials) {
            this.loader.load('lamborghini-aventador.obj', function(event) {
                var obj = event.detail.loaderRootNode
                for (var i = 0; i < obj.children.length; i++)
                {
                    var mat = new THREE.MeshPhongMaterial({color: 0x005ecc});
                    var mesh = new THREE.Mesh(obj.children[i].geometry, mat);
                    mesh.scale.set(0.01, 0.01, 0.01);
                    this.scene.add(obj);
                    var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
                    var mat = new THREE.LineBasicMaterial( { color: 0x6fb6ff, linewidth: 10 } );
                    var wireframe = new THREE.LineSegments( geo, mat );
                    mesh.add( wireframe );
                }
            }.bind(this), function(xhr) {
                var percent = Math.floor(xhr.loaded / xhr.total * 100);
                document.getElementById('center-text').innerHTML = 'Loading...';
                document.getElementById('slider').style.width = percent + '%';
                document.getElementById('load-text').innerHTML = percent + '%';
                if (percent == 100)
                {
                    document.getElementById('end').style.borderColor = 'rgb(39, 240, 39)';
                    $('#loading-container').animate(
                        {
                            opacity: 0
                        }, 200, 'linear', function()
                        {
                            $(this).remove();
                        }
                    );
                }
            }, null, null, null, true);
        });*/

        var scope = this;

        var onLoadObj = function ( event ) {
            //event.detail.loaderRootNode.scale.set(scope.SCALE, scope.SCALE, scope.SCALE);
            scope.scene.add( event.detail.loaderRootNode );
            scope.worldcenter = new THREE.Vector3();//scope.getCentroid();

            scope.scene.traverse(function(node) {
                for (var i = 0; i < node.children.length; i++)
                {
                    var child = node.children[i];
                    if (child.geometry != undefined)
                    {
                        var edges = new THREE.EdgesGeometry( child.geometry, 90 );
                        var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xeeeeee}));
                        line.scale.set(scope.SCALE, scope.SCALE, scope.SCALE);
                        scope.scene.add(line);
                    }
                }
            });
            
            // scope.scene.traverse(function (node) {
            //     node.position.set(-scope.worldcenter.x * 2, -scope.worldcenter.y * 2, -scope.worldcenter.z * 2);
            // });

            // event.detail.loaderRootNode.children[0].geometry.computeBoundingBox();
            // var bounds = event.detail.loaderRootNode.children[0].geometry.boundingBox;
            // var diff = new THREE.Vector3(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z);
            // var size = Math.max(bounds.max.x - bounds.min.x, bounds.max.z - bounds.min.z);

            // var edges = new THREE.EdgesGeometry( event.detail.loaderRootNode.children[0].geometry, 8 );
            // var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xaaaaaa}));
            // line.material.linewidth = 2;
            // scope.scene.add(line);

            // var geometry = new THREE.BoxBufferGeometry( diff.x * 5, diff.y * 5, diff.z * 5 );
            // var edges = new THREE.EdgesGeometry( geometry );
            // var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xffffff}));
            // scope.scene.add(line);

            // var grid = new THREE.GridHelper(size);
            // grid.position.y = bounds.min.y;
            // scope.scene.add(grid);

            $('#loading-container').animate(
                {
                    opacity: 0
                }, 200, 'linear', function()
                {
                    $(this).remove();
                }
            );
        };
        
        var onProgress = function ( xhr ) {
            var percent = Math.floor(xhr.loaded / xhr.total * 100);
            document.getElementById('center-text').innerHTML = 'Downloading...';
            document.getElementById('slider').style.width = percent + '%';
            document.getElementById('load-text').innerHTML = percent + '%';
            if (percent == 100)
            {
                document.getElementById('end').style.borderColor = 'rgb(39, 240, 39)';
                $('#center-text')[0].innerHTML = 'Parsing...';
                document.getElementById('slider').style.width = 0 + '%';
                $('#slider').animate(
                    {
                        width: '100%'
                    }, 2000, 'linear'
                );
            }
        }

		var onLoadMtl = function ( materials ) {
			scope.loader.setMaterials( materials );
			scope.loader.setLogging( false, false );
            scope.loader.load( toLoad + '.obj', onLoadObj, onProgress, null, null, true );
		};
		scope.loader.loadMtl( 'objs/' + toLoad + '.mtl', null, onLoadMtl );

        // Move camera out,
        this.camera.position.z = 2.5;
    }

    update()
    {
        this.camera.updateMatrixWorld();
        this.controls.update();

        this.viewlight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.TICK += this.clock.getDelta();
    }

    draw()
    {
        this.renderer.render(this.scene, this.camera);
    }

    cycle()
    {
        this.update();
        this.draw();
    }
}

// Create engine,
new Engine('10.45');
