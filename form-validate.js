/*
* @autor sgb004
*/
function FormValidate( form, o ){
	this.fieldParent = 'form-group';
	this.fieldErroresContainer = 'alerts-container';
	this.errorTheme = '<div class="alert alert-dismissable alert-danger">{{ msg }}</div>';
	this.errorClass = '.alert';
	this.notices = {
		empty: 'Is a required field',
		minlength: 'The minimum size is of ',
		maxlength: 'The maximum size is of '
	};
	this.errorsList = {};
	this.listeners = {};

	this.form = form;
	this.fields = this.form.querySelectorAll( '*[name]' );
	this.init( this );
	return this;
}

FormValidate.prototype = {
	init: function( _this ){
		var i, type, parent, field;
		var fields = {};
		var preErrors = this.form.querySelectorAll( this.errorClass );

		console.log( preErrors );
		this.form.setAttribute( 'novalidate', 'novalidate' );

		for( i=0; i<preErrors.length; i++ ){
			parent = preErrors[i];
			do{
				parent = parent.parentNode;
				tag = parent.tagName.toLowerCase();
			} while ( !parent.classList.contains( this.fieldParent ) && tag != 'form' );
			field = parent.querySelector('input, select, textarea');
			console.log( parent );
			console.log( field );
			if( field != null && field != undefined ){
				if( this.errorsList[ field.name ] == undefined ){
					this.errorsList[ field.name ] = [];
				}
				this.errorsList[ field.name ].push( preErrors[i] );
			}
			console.log( field );
		}

		console.log( this.errorsList );

		for( i=0; i<this.fields.length; i++ ){
			type = this.fields[ i ].tagName;
			type = type.toLowerCase();

			if( type == 'input' ){
				type = this.fields[ i ].type.toLowerCase();
			}

			if( type == 'hidden' || type == 'submit' || fields[ this.fields[ i ].name ] != undefined ){ continue; } 

			if( type == 'radio' ){
				var j;
				var inputs = this.form.querySelectorAll( 'input[name="'+this.fields[ i ].name+'"]' );
				for( j=0; j<inputs.length; j++ ){
					inputs[ j ].addEventListener('change', function(){
						_this.clearErrorField( this.name );
					}, false);
				}
				this.fields[ i ]['validate'] = function(){
					var isValid = true;
					var required = this.getAttribute( 'required' );
					if( required != null && required != undefined ){
						var checked = this.form.querySelector( 'input[name="'+this.name+'"]:checked' );
						if( checked == null || checked == undefined ){
							isValid = false;
							_this.addErrorField( this.name, _this.notices.empty );
						}
					}

					return _this.applyListenerField( this.name, isValid );
				};
			} else if ( type == 'select' ){
				this.fields[ i ]['validate'] = function(){
					var isValid = true;
					var required = this.getAttribute( 'required' );
					if( required != null && required != undefined && ( this.value == '' || this.value == null || this.value == undefined ) ){
							isValid = false;
							_this.addErrorField( this.name, _this.notices.empty );
					}
					return _this.applyListenerField( this.name, isValid );
				}
				this.fields[ i ].addEventListener( 'change', function(){
					_this.clearErrorField( this.name );
					this.validate();
				});
			} else {
				this.fields[ i ]['validate'] = function(){
					var isValid = true;
					var required = this.getAttribute( 'required' );
					var value = this.value;
					var pattern = this.getAttribute( 'data-pattern' );
					var minlength = this.getAttribute('minlength');
					var maxlength = this.getAttribute('maxlength');

					if( required != null && required != undefined ){
						value = value.trim();
						if( value == '' ){
							isValid = false;
							_this.addErrorField( this.name, _this.notices.empty );
						}
					}

					if( (pattern != null || pattern != undefined) && value != '' ){
						pattern = new RegExp( pattern );
						if( !pattern.test( value ) ){
							_this.addErrorField( this.name, this.getAttribute('data-pattern-error') );
							isValid = false;
						}
					}

					if( minlength != null || minlength != undefined ){
						minlength = parseInt( minlength );
						if( isNaN( minlength ) ){
							minlength = 0;
						}
						if( minlength > 0 && value.length < minlength ){
							_this.addErrorField( this.name, _this.notices.minlength+minlength );
							isValid = false;
						}
					}

					if( maxlength != null || maxlength != undefined ){
						maxlength = parseInt( maxlength );
						if( isNaN( maxlength ) ){
							maxlength = 0;
						}
						if( maxlength > 0 && value.length < maxlength ){
							_this.addErrorField( this.name, _this.notices.maxlength+maxlength );
							isValid = false;
						}
					}

					return _this.applyListenerField( this.name, isValid );
				};
				this.fields[ i ].addEventListener( 'change', function(){
					_this.clearErrorField( this.name );
					this.validate();
				});
			}
			fields[ this.fields[ i ].name ] = this.fields[ i ];
		}
		this.fields = fields;

		this.form.onsubmit = function( e ){
			e.preventDefault();
			_this.submit();
		}
	},
	submit: function( e ){
		var field, fieldIsValid, parent;
		var isValid = true;
		this.clearAllErrors();
		for( field in this.fields ){
			fieldIsValid = this.fields[field].validate();
			if( !fieldIsValid ){
				isValid = false;
			}
		}
		if( isValid ){
			var _this = this;
			this.form.onsubmit = null;
			this.form.submit();
			this.form.onsubmit = function( e ){
				e.preventDefault();
				_this.submit();
			}
		}
	},
	addErrorField: function( field, notice ){
		if( this.fields[field] != undefined ){
			var parent = this.fields[field];
			var tag, errorsContainer;
			var errorContainer = document.createElement('div'); this.errorTheme;
			errorContainer.innerHTML = this.errorTheme.replace('{{ msg }}', notice);
			errorContainer = errorContainer.childNodes[0];

			if( this.errorsList[ field ] == undefined ){
				this.errorsList[ field ] = [];
			}

			this.errorsList[ field ].push( errorContainer );

			do {
				parent = parent.parentNode;
				tag = parent.tagName.toLowerCase();
			} while ( !parent.classList.contains( this.fieldParent ) && tag != 'body' );
			errorsContainer = parent.querySelector( this.fieldErroresContainer );

			if( errorsContainer != null && errorsContainer != undefined ){
				errorsContainer.appendChild( errorContainer );
			}else{
				parent.appendChild( errorContainer );
				parent.appendChild( errorContainer );
			}
		}
	},
	clearAllErrors: function(){
		var field;
		for( field in this.errorsList ){
			this.clearErrorField( field );
		}
		this.errorsList = {};
	},
	clearErrorField: function( field ){
		if( this.errorsList[field] != undefined ){
			console.log( 'borrando '+field );
			console.log( this.errorsList[field] );
			var i;
			for( i=0; i<this.errorsList[field].length; i++){
				console.log( this.errorsList[field][ i ] );
				this.errorsList[field][ i ].parentNode.removeChild( this.errorsList[field][ i ] );
			}
			this.errorsList[field] = [];
		}
	},
	validateField: function( field ){
		this.clearErrorField( field );
		this.fields[field].validate();
	},
	addListenerField: function( field, fn ){
		this.listeners[ field ] = fn;
	},
	applyListenerField: function( field, isValid){
		if( this.listeners[ field ] != undefined ){
			isValid = this.listeners[ field ]( this, isValid );
		}
		return isValid;
	}		
};
