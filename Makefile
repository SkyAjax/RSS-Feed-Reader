install:
	npm ci

lint:
	npx eslint .

test-coverage:
	NODE_OPTIONS=--experimental-vm-modules npm test --coverageProvider=v8 -- --coverage 
