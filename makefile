src-files = $(wildcard src/*.js)
lib-files = $(patsubst src/%.js, lib/%.js, $(src-files))

all: $(lib-files)

lib/%.js: src/%.js lib
	node_modules/.bin/babel -o $@ $<

lib:
	mkdir -p $@
