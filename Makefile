CLOSURE_COMPILER_DIR = tools/closure-compiler
CLOSURE_COMPILER_FLAGS = 
CLOSURE_COMPILER = java -jar $(CLOSURE_COMPILER_DIR)/compiler.jar

# Note that the order of this list is important. If foo.js depends on bar.js,
# then bar.js must appear *before* foor.js in the list.
SRCS = \
  src/base.js \
  src/states.js \
  src/browser.js \
  src/gameloop.js \
  src/intersections/raybox.js \
  src/intersections/raysphere.js \
  src/keyboard.js \
  src/loader.js \
  src/math.js \
  src/mouse.js

TEST_SRCS = \
  tests/test-base.js \
  tests/test-math.js \
  tests/test-states.js \
  tests/intersections/test-raybox.js


# Note here that we don't build a minified version of test-ludum.js. It's
# because the Closure Compiler chokes on QUnit's throws() function, saying it's
# a reserved word
all: dirs build/ludum.js build/ludum.min.js build/test-ludum.js


.PHONY: dirs
dirs:
	@mkdir -p build


build/ludum.min.js: $(SRCS)
	$(CLOSURE_COMPILER) --js_output_file $@ $^

build/ludum.js: $(SRCS)
	cat $^ > $@

build/test-ludum.js: $(TEST_SRCS)
	cat $^ > $@


clean:
	rm -rf build

