develop:
	npx webpack-dev-server

lint:
	npx eslint .

build:
	rm -rf dist
	NODE_ENV=production npx webpack
