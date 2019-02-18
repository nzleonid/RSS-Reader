install:
	npm install
start:
	npx babel-node -- src/bin/rss.js
publish:
	npm publish
lint:
	npx eslint .
test:
	npm test
build:
	rm -rf dist
	npm run build
