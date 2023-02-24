;(function ( $ ) {
	'use strict';

	/**
	 * @TODO Code a function the calculate available combination instead of use WC hooks
	 */
	$.fn.cartzilla_variations_radio_style_form = function () {
		return this.each( function() {
			var $form = $( this );

			$form
				.on( 'click', '.custom-radio', function ( e ) {
					e.preventDefault();
					var $el = $( this );

					$el.find( '.custom-control-input' ).prop( "checked", true );

					var attributes = $(this).data( 'attributes' );

					$.map( attributes, function( val, i ) {
						var attribute_name = val.attribute_name,
						attribute_value = val.attribute_value,
						$select = $form.find( 'select[name="'+ attribute_name +'"]' );

						$select.trigger( 'focusin' );
						$select.val( attribute_value );

						$select.change();
					});
				} );
		} );
	};

	$( function () {
		$( '.variations_form' ).cartzilla_variations_radio_style_form();
		$( document.body ).trigger( 'cartzilla_variations_radio_style_initialized' );
	} );
})( jQuery );