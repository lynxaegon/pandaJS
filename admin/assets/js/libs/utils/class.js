/// <summary>Class Module</summary>
/// <description>Module to implement Inheritance.</description>
/// <version>1.0</version>
/// <author>John DeVight</author>
/// <license>
/// Licensed under the MIT License (MIT)
/// You may obtain a copy of the License at
/// http://opensource.org/licenses/mit-license.html
/// </license>

// modified by Andrei Vaduva <andrei.vaduva@gmail.com>
PandaJS = window.PandaJS || {};
PandaJS.BaseClass = (function () {
	function _defineMethodsAndProperties (cls, def) {
		/// <summary>Identify the methods and properties.</summary>
		for (var key in def) {
			if(key == "_static")
				continue;

			if (typeof def[key] === "function") {
				// This is a method.
				cls.prototype[key] = (function(_super, fn){
					return function() {
						var tmp = this._super;
						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = _super;
						// The method only need to be bound temporarily, so we
						// remove it when we're done executing

						if(def.className)
							fn.className = def.className;
						else
							fn.className = "UnknownClass";

						var ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				})(cls.prototype[key], def[key]);
			} else {
				// This is a member variable.
				Object.defineProperty(cls.prototype, key, {
					value: def[key],
					writable: true,
					configurable: true,
					enumerable: true
				});
			}
		}
	};

	function extend (className, parent, def) {
		/// <summary>Extend the object with additional methods and properties.</summary>
		if(typeof className !== "string")
		{
			def = parent;
			parent = className;
		}

		var cls = null;

		if (def.init === undefined) {
			// The class doesn't have a constructor, so create a constructor
			// that calls the parent constructor.
			cls = (function(_super, fn){
				return function() {
					var tmp = this._super;
					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super;
					this.$this = this;
					// The method only need to be bound temporarily, so we
					// remove it when we're done executing

					if(def.className)
						fn.className = def.className;
					else
						fn.className = "UnknownClass";

					var ret = fn.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(parent, function(){
				this._super.apply(this, arguments);
			});

		} else {
			// Use the class constructor.
			cls = (function(_super, fn){
				return function() {
					var tmp = this._super;
					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super;
					this.$this = this;
					// The method only need to be bound temporarily, so we
					// remove it when we're done executing

					if(def.className)
						fn.className = def.className;
					else
						fn.className = "UnknownClass";

					var ret = fn.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(parent, def.init);
		}

		cls.prototype = Object.create(parent.prototype);
		cls.prototype.constructor = cls;

		_defineMethodsAndProperties(cls, def);

		// Enforce static from _static in Class and Prototype
		if(def['_static'])
		{
			for (var key in def['_static']) {
				if(!def['_static'].hasOwnProperty(key))
					continue;

				cls[key] = def['_static'][key];
				cls.prototype[key] = def['_static'][key]
			}
		}

		/**
		 * Used when extending @BaseClass classes
		 * @param className
		 * @param def
		 * @returns {*}
		 */
		cls.extend = function (className, def) {
			if(typeof className !== "string") {
				return extend(cls, className);
			}

			return extend(className, cls, def);
		};
		/**
		 * Used when extending non @BaseClass (ex: object/Array/String/etc..)
		 * @param cls
		 * @param def
		 * @returns {*}
		 */
		cls.extendObject = function (cls, def) {
			return extend(cls, def);
		};

		if(typeof className !== "string")
			className = "_not_set_";

		if(parent['className'])
			className = parent['className'];

		if(def['className'])
			className = def['className'];

		cls.className = className;
		cls.prototype.className = className;

		return cls;
	};

	function define (def) {
		/// <summary>Define a new object.</summary>


		var cls = def.init || function(){};

		_defineMethodsAndProperties(cls, def);

		/**
		 * Used when extending @BaseClass classes
		 * @param className
		 * @param def
		 * @returns {*}
		 */
		cls.extend = function (className, def) {
			if(typeof className !== "string") {
				return extend(cls, className);
			}

			return extend(className, cls, def);
		};
		/**
		 * Used when extending non @BaseClass (ex: object/Array/String/etc..)
		 * @param cls
		 * @param def
		 * @returns {*}
		 */
		cls.extendObject = function (cls, def) {
			return extend(cls, def);
		};

		// Return the class definition.
		return cls;
	}

	return {
		define: define,
		extend: extend
	}
}()).define({});