<?php

namespace Maith\Common\TranslatorBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

/**
 * Description of GetTranslataionType
 *
 * @author Rodrigo Santellan
 */
class GetTranslataionType extends AbstractType
{
  public function buildForm(FormBuilderInterface $builder, array $options)
  {
      $builder
          ->add('bundle',ChoiceType::class, array(
                'choices_as_values' => true,
                'choices' => $options['bundles'],
          ))
          ->add('lang', ChoiceType::class, array(
              'choices_as_values' => true,
              'choices' => $options['langs'],
          ));
  }
 
  /**
   * @param OptionsResolverInterface $resolver
   */
  public function configureOptions(OptionsResolver $resolver)
  {
      $resolver->setDefaults(array(
          'bundles' => array(),
          'langs' => array(),
      ));
  }
    
  public function getBlockPrefix() {
    return 'maith_translator_get_type';
  }

}
