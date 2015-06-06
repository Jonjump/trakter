test:
	mocha --reporter spec
 .PHONY: test

docs:
	yuidoc -o ./docs ./
 .PHONY: docs
 