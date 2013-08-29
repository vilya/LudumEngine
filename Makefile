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


all: dirs build/ludum.min.js


.PHONY: dirs
dirs:
	@mkdir -p build


build/ludum.min.js: $(SRCS)
	$(CLOSURE_COMPILER) --js_output_file $@ $^


build/ludum.js: $(SRCS)
	cat $(SRCS) > $@


clean:
	rm -rf build

