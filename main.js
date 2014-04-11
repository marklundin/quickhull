window.onload = function(){


	var isStatic = getParameterByName( 'static' ) === 'true';

	console.log( "isStatic", isStatic );


	// THE USUAL SUSPECTS
	var scene = new THREE.Scene(),
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
		renderer = new THREE.WebGLRenderer(),
		controls = new THREE.OrbitControls( camera );

	camera.position.z = 600;
	renderer.autoClear = false;
	controls.noZoom = true;
	controls.noPan = true;

	document.querySelector( '#container' ).appendChild( renderer.domElement );


	function resize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		cubeCamera.aspect = window.innerWidth / window.innerHeight;
		cubeCamera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}




	// SKYBOX


	var cubeCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		cubeScene = new THREE.Scene();


	var path = "textures/cube/Park3Med/",
		format = '.jpg',
		urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var textureCube = THREE.ImageUtils.loadTextureCube( urls );
	var shader = THREE.ShaderLib[ "cube" ];
		shader.uniforms[ "tCube" ].value = textureCube;

	var material = new THREE.ShaderMaterial( {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		side: THREE.BackSide,
		depthWrite: false

	} ),

	mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
	cubeScene.add( mesh );



	///


	var NUM_VERTS 	= isStatic ? 1000 : 100,
		RADIUS 		= 200,
		SPEED 		= 0.01,
		vertices 	= [],
		quaternion 	= new THREE.Quaternion,
		geometry 	= new THREE.Geometry();


	// Since we're moving the vertices every frame, make it dynamic
	geometry.dynamic = true;


	// Create some vertices
	i = NUM_VERTS;
	while( i-- > 0 ){ 

		// Set up some initial positions
		geometry.vertices[i] = new THREE.Vector3(
			( Math.random() + 0.01 ) * 2.0 - 1.0, 
			( Math.random() + 0.01 ) * 2.0 - 1.0, 
			( Math.random() + 0.01 ) * 2.0 - 1.0
		).normalize().multiplyScalar( RADIUS );

		vertices[i] = {
			vertex: geometry.vertices[i],
			axis: new THREE.Vector3(
				( Math.random() + 0.01 ) * 2.0 - 1.0, 
				( Math.random() + 0.01 ) * 2.0 - 1.0, 
				( Math.random() + 0.01 ) * 2.0 - 1.0
			).normalize(),
			velocity: (( Math.random() * 2.0 ) + 0.3 ) * SPEED
		}

	}

	function update(){

		// Reposition all the vertices
		i = vertices.length;
		while( i-- > 0 ){ 

			quaternion.setFromAxisAngle( vertices[i].axis, vertices[i].velocity )
			vertices[i].vertex.applyQuaternion( quaternion );			

		}

		if( isStatic ) console.time('hull')
		QuickHull( geometry );
		if( isStatic ) console.timeEnd('hull')
		geometry.verticesNeedUpdate = true;			
		
	}
	
	update();
	scene.add( new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ envMap: textureCube, reflectivity: 0.9})));


    function animate(){

    	controls.update();
    	if( !isStatic ) update();
    	cubeCamera.rotation.copy( camera.rotation );

    	renderer.clear();

    	// Oooh, double render...
    	renderer.render( cubeScene, cubeCamera );
    	renderer.render( scene, camera );
    	

    	requestAnimationFrame( animate );

    }

    window.addEventListener( 'resize', resize )
	resize();
    animate();

}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}