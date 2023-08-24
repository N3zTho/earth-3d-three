import * as THREE from "three"
import ThreeGlobe from "three-globe"
import { TrackballControls } from "./libs/TrackballControls"
import { CSS2DRenderer } from "./libs/CSS2DObject"

Object.assign(THREE, { TrackballControls, CSS2DRenderer })

const markerSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 36 36" fill="#ee761e" style="enable-background:new 0 0 36 36;" xml:space="preserve">
<path d="M18,0C10.3,0,4,5.6,4,12.6C4,24.1,18,36,18,36s14-12,14-23.4C32,5.6,25.7,0,18,0z M18,21c-3.9,0-7-3.1-7-7s3.1-7,7-7
	s7,3.1,7,7S21.9,21,18,21z"/>
</svg>
`

// Gen random data
const N = 30

const gData = [...Array(N).keys()].map(() => ({
	lat: (Math.random() - 0.5) * 180,
	lng: (Math.random() - 0.5) * 360,
	size: 7 + Math.random() * 30,
	color: ["red", "white", "blue", "green"][Math.round(Math.random() * 3)],
}))

const arcsData = [...Array(N).keys()].map(() => ({
	startLat: (Math.random() - 0.5) * 180,
	startLng: (Math.random() - 0.5) * 360,
	endLat: (Math.random() - 0.5) * 180,
	endLng: (Math.random() - 0.5) * 360,
	color: "#ee761e",
}))

;[...document.querySelectorAll(".elementor-globe3d")].forEach((globe) => {
	createGlob3D(globe)
})

function createGlob3D(globe) {
	const Globe = new ThreeGlobe()
		.globeImageUrl("/static/images/2k_earth_particles_map.webp")
		// .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
		.atmosphereAltitude(0.1)
		.atmosphereColor("#ee761e")
		.htmlElementsData(gData)
		.htmlElement((d) => {
			const el = document.createElement("div")
			el.innerHTML = markerSvg
			el.style.color = "#ee761e"
			el.style.width = `${d.size}px`
			return el
		})
		.arcsData(arcsData)
		.arcColor("color")
		.arcDashLength(0.4)
		.arcDashGap(4)
		.arcDashInitialGap(() => Math.random() * 5)
		.arcDashAnimateTime(1000)

	// Setup renderers
	const renderer2 = new THREE.WebGLRenderer({ alpha: true })
	renderer2.setClearColor(0xffffff, 0)
	const renderers = [renderer2, new THREE.CSS2DRenderer()]
	renderers.forEach((r, idx) => {
		r.setSize(window.innerWidth, window.innerHeight)

		if (idx > 0) {
			// overlay additional on top of main renderer
			r.domElement.style.position = "absolute"
			r.domElement.style.top = "0px"
			r.domElement.style.pointerEvents = "none"
		}
		globe.appendChild(r.domElement)
	})

	const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI)
	directionalLight1.position.set(1, 1, 1)

	const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI)
	directionalLight2.position.set(-1, 0, -1)

	// Setup scene
	const scene = new THREE.Scene()
	scene.add(Globe)
	scene.add(new THREE.AmbientLight(0xffffff, 1))
	scene.add(directionalLight1)
	scene.add(directionalLight2)

	// Setup camera
	const camera = new THREE.PerspectiveCamera()
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	camera.position.z = 400

	// Add camera controls
	const tbControls = new THREE.TrackballControls(
		camera,
		renderers[0].domElement
	)
	tbControls.minDistance = 101
	tbControls.rotateSpeed = 0.7
	tbControls.zoomSpeed = 0.8
	tbControls.mouseButtons = { LEFT: 0 }
	tbControls.noZoom = true
	tbControls.animationX = true
	tbControls.animationXSpeed = 0.003;

	// Update pov when camera moves
	Globe.setPointOfView(camera.position, Globe.position)
	tbControls.addEventListener("change", () => {
		Globe.setPointOfView(camera.position, Globe.position)
	})

	window.addEventListener("resize", function () {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderers.forEach((r, idx) => {
			r.setSize(window.innerWidth, window.innerHeight)
		})
	})	
		
	// Kick-off renderers
	;(function animate() {
		// IIFE
		// Frame cycle
		tbControls.update(false);
		renderers.forEach((r) => r.render(scene, camera))
		requestAnimationFrame(animate)
	})()
}
