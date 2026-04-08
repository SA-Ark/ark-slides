/**
 * @ark/slides test suite
 * Tests core functionality, transitions, animations, gradient fills, and fflate compression.
 */

import PptxGenJS from '../src/bld/pptxgen.cjs.js'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

let passed = 0
let failed = 0
const results = []

function test(name, fn) {
	try {
		fn()
		passed++
		results.push(`  PASS: ${name}`)
	} catch (e) {
		failed++
		results.push(`  FAIL: ${name} - ${e.message}`)
	}
}

async function asyncTest(name, fn) {
	try {
		await fn()
		passed++
		results.push(`  PASS: ${name}`)
	} catch (e) {
		failed++
		results.push(`  FAIL: ${name} - ${e.message}`)
	}
}

// ===== Basic Functionality =====

test('creates a presentation', () => {
	const pptx = new PptxGenJS()
	assert.ok(pptx)
	assert.strictEqual(pptx.version, '5.0.0-alpha.1')
})

test('adds a slide', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	assert.ok(slide)
	assert.strictEqual(pptx.slides.length, 1)
})

test('adds text to slide', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('Hello World', { x: 1, y: 1, w: 5, h: 1 })
	assert.strictEqual(slide._slideObjects.length, 1)
})

test('adds image to slide', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addImage({ data: 'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', x: 1, y: 1, w: 2, h: 2 })
	assert.strictEqual(slide._slideObjects.length, 1)
})

test('adds shape to slide', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addShape(pptx.ShapeType.rect, { x: 1, y: 1, w: 3, h: 2, fill: { color: 'FF0000' } })
	assert.strictEqual(slide._slideObjects.length, 1)
})

test('adds notes to slide', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addNotes('Speaker notes here')
	assert.ok(slide._slideObjects.some(o => o._type === 'notes'))
})

test('sets layout', () => {
	const pptx = new PptxGenJS()
	pptx.layout = 'LAYOUT_WIDE'
	assert.strictEqual(pptx.layout, 'LAYOUT_WIDE')
})

test('defines custom layout', () => {
	const pptx = new PptxGenJS()
	pptx.defineLayout({ name: 'A4', width: 10, height: 7.5 })
	pptx.layout = 'A4'
	assert.strictEqual(pptx.layout, 'A4')
})

test('adds section', () => {
	const pptx = new PptxGenJS()
	pptx.addSection({ title: 'Charts' })
	assert.strictEqual(pptx.sections.length, 1)
})

// ===== Transitions =====

test('sets fade transition', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.transition = { type: 'fade', duration: 1000 }
	assert.strictEqual(slide.transition.type, 'fade')
	assert.strictEqual(slide.transition.duration, 1000)
})

test('sets push transition', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.transition = { type: 'push', duration: 500 }
	assert.strictEqual(slide.transition.type, 'push')
})

test('sets morph transition', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.transition = { type: 'morph', option: 'byObject' }
	assert.strictEqual(slide.transition.type, 'morph')
	assert.strictEqual(slide.transition.option, 'byObject')
})

test('sets all transition types', () => {
	const types = ['fade', 'push', 'wipe', 'split', 'reveal', 'cover', 'zoom', 'morph']
	types.forEach(type => {
		const pptx = new PptxGenJS()
		const slide = pptx.addSlide()
		slide.transition = { type }
		assert.strictEqual(slide.transition.type, type)
	})
})

// ===== Animations =====

test('adds animation to text', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('Animated', { x: 1, y: 1, w: 5, h: 1, animation: { effect: 'fadeIn', trigger: 'afterPrevious', duration: 500 } })
	assert.strictEqual(slide._slideObjects[0].options.animation.effect, 'fadeIn')
})

test('adds animation to shape', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addShape(pptx.ShapeType.rect, { x: 1, y: 1, w: 3, h: 2, animation: { effect: 'wipeFromLeft', trigger: 'onClick' } })
	assert.strictEqual(slide._slideObjects[0].options.animation.effect, 'wipeFromLeft')
})

test('supports all animation effects', () => {
	const effects = ['fadeIn', 'fadeOut', 'wipeFromBottom', 'wipeFromTop', 'wipeFromLeft', 'wipeFromRight', 'riseUp', 'flyInFromLeft', 'flyInFromRight', 'pulse']
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	effects.forEach(effect => {
		slide.addText(effect, { x: 1, y: 1, w: 5, h: 1, animation: { effect } })
	})
	assert.strictEqual(slide._slideObjects.length, effects.length)
})

// ===== Gradient Fill =====

test('adds gradient fill to shape', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addShape(pptx.ShapeType.rect, {
		x: 1, y: 1, w: 5, h: 3,
		gradientFill: {
			type: 'linear',
			angle: 45,
			stops: [
				{ position: 0, color: 'FF0000' },
				{ position: 100, color: '0000FF' },
			],
		},
	})
	assert.strictEqual(slide._slideObjects[0].options.gradientFill.type, 'linear')
})

test('supports radial gradient', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addShape(pptx.ShapeType.rect, {
		x: 1, y: 1, w: 5, h: 3,
		gradientFill: {
			type: 'radial',
			stops: [
				{ position: 0, color: 'FFFFFF' },
				{ position: 50, color: '888888' },
				{ position: 100, color: '000000' },
			],
		},
	})
	assert.strictEqual(slide._slideObjects[0].options.gradientFill.stops.length, 3)
})

test('supports path gradient', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addShape(pptx.ShapeType.rect, {
		x: 1, y: 1, w: 5, h: 3,
		gradientFill: {
			type: 'path',
			stops: [
				{ position: 0, color: 'FF0000', transparency: 20 },
				{ position: 100, color: '00FF00' },
			],
		},
	})
	assert.strictEqual(slide._slideObjects[0].options.gradientFill.type, 'path')
})

// ===== Mutation Bug Fix =====

test('addShape does not mutate options', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	const opts = { x: 1, y: 1, w: 3, h: 2 }
	const originalKeys = Object.keys(opts).length
	slide.addShape(pptx.ShapeType.rect, opts)
	// The original opts object should not have been modified
	assert.strictEqual(Object.keys(opts).length, originalKeys, 'Options object was mutated')
})

test('addText does not mutate options', () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	const opts = { x: 1, y: 1, w: 5, h: 1, color: 'FF0000' }
	const originalColor = opts.color
	slide.addText('Test', opts)
	assert.strictEqual(opts.color, originalColor, 'Text options color was mutated')
})

// ===== Export (fflate) =====

await asyncTest('exports to nodebuffer', async () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('Hello', { x: 1, y: 1, w: 5, h: 1 })
	const data = await pptx.write({ outputType: 'nodebuffer' })
	assert.ok(data instanceof Buffer, 'Should be a Buffer')
	assert.ok(data.length > 0, 'Buffer should not be empty')
	// Check ZIP magic number
	assert.strictEqual(data[0], 0x50, 'ZIP magic byte 1')
	assert.strictEqual(data[1], 0x4B, 'ZIP magic byte 2')
})

await asyncTest('exports to base64', async () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('Hello', { x: 1, y: 1, w: 5, h: 1 })
	const data = await pptx.write({ outputType: 'base64' })
	assert.ok(typeof data === 'string', 'Should be a string')
	assert.ok(data.length > 0, 'Base64 string should not be empty')
})

await asyncTest('exports to uint8array', async () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('Hello', { x: 1, y: 1, w: 5, h: 1 })
	const data = await pptx.write({ outputType: 'uint8array' })
	assert.ok(data instanceof Uint8Array, 'Should be Uint8Array')
})

await asyncTest('exports to arraybuffer', async () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('Hello', { x: 1, y: 1, w: 5, h: 1 })
	const data = await pptx.write({ outputType: 'arraybuffer' })
	assert.ok(data instanceof ArrayBuffer, 'Should be ArrayBuffer')
})

await asyncTest('stream() works', async () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('Stream test', { x: 1, y: 1, w: 5, h: 1 })
	const data = await pptx.stream()
	assert.ok(data instanceof Buffer, 'Stream should return Buffer')
})

await asyncTest('writeFile() works', async () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('WriteFile test', { x: 1, y: 1, w: 5, h: 1 })
	const tmpFile = '/tmp/ark-slides-test-output.pptx'
	const result = await pptx.writeFile({ fileName: tmpFile })
	assert.ok(fs.existsSync(tmpFile), 'File should exist')
	const stat = fs.statSync(tmpFile)
	assert.ok(stat.size > 0, 'File should not be empty')
	fs.unlinkSync(tmpFile)
})

await asyncTest('compression produces smaller output', async () => {
	const pptx = new PptxGenJS()
	for (let i = 0; i < 10; i++) {
		const slide = pptx.addSlide()
		slide.addText('Repeated content for compression test ' + i, { x: 1, y: 1, w: 8, h: 1 })
	}
	const data = await pptx.write({ outputType: 'nodebuffer' })
	// Just verify it's valid and non-trivially sized
	assert.ok(data.length > 100, 'Output should be > 100 bytes')
	assert.ok(data.length < 100000, 'Compressed output should be < 100KB for 10 slides')
})

await asyncTest('exports with transitions', async () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('With transition', { x: 1, y: 1, w: 5, h: 1 })
	slide.transition = { type: 'fade', duration: 1000 }
	const data = await pptx.write({ outputType: 'nodebuffer' })
	assert.ok(data.length > 0, 'Should export with transition')
})

await asyncTest('exports with animations', async () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addText('Animated', { x: 1, y: 1, w: 5, h: 1, animation: { effect: 'fadeIn', trigger: 'afterPrevious', duration: 500 } })
	const data = await pptx.write({ outputType: 'nodebuffer' })
	assert.ok(data.length > 0, 'Should export with animations')
})

await asyncTest('exports with gradient fill', async () => {
	const pptx = new PptxGenJS()
	const slide = pptx.addSlide()
	slide.addShape(pptx.ShapeType.rect, {
		x: 1, y: 1, w: 5, h: 3,
		gradientFill: {
			type: 'linear',
			angle: 90,
			stops: [
				{ position: 0, color: 'FF0000' },
				{ position: 50, color: '00FF00' },
				{ position: 100, color: '0000FF' },
			],
		},
	})
	const data = await pptx.write({ outputType: 'nodebuffer' })
	assert.ok(data.length > 0, 'Should export with gradient fill')
})

await asyncTest('exports complex presentation', async () => {
	const pptx = new PptxGenJS()
	pptx.title = 'Test Presentation'
	pptx.author = 'Ark'

	// Slide 1: Title with fade transition
	const slide1 = pptx.addSlide()
	slide1.addText('Welcome', { x: 1, y: 2, w: 8, h: 2, fontSize: 36, color: '363636', animation: { effect: 'fadeIn' } })
	slide1.transition = { type: 'fade', duration: 1000 }

	// Slide 2: Content with push transition
	const slide2 = pptx.addSlide()
	slide2.addShape(pptx.ShapeType.rect, {
		x: 0.5, y: 0.5, w: 9, h: 5,
		gradientFill: { type: 'radial', stops: [{ position: 0, color: 'FFFFFF' }, { position: 100, color: 'CCCCCC' }] },
	})
	slide2.addText('Content slide', { x: 1, y: 1, w: 5, h: 1, animation: { effect: 'wipeFromLeft', trigger: 'afterPrevious' } })
	slide2.transition = { type: 'push', duration: 750 }

	// Slide 3: Morph
	const slide3 = pptx.addSlide()
	slide3.addText('Morph demo', { x: 1, y: 1, w: 5, h: 1 })
	slide3.transition = { type: 'morph', option: 'byObject' }

	const data = await pptx.write({ outputType: 'nodebuffer' })
	assert.ok(data instanceof Buffer)
	assert.ok(data.length > 1000, 'Complex presentation should be substantial')

	// Verify it's a valid ZIP
	assert.strictEqual(data[0], 0x50)
	assert.strictEqual(data[1], 0x4B)
})

// ===== Report =====

console.log('\n=== @ark/slides Test Results ===')
results.forEach(r => console.log(r))
console.log(`\nTotal: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`)

if (failed > 0) {
	process.exit(1)
}
