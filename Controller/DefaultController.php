<?php

namespace Maith\Common\TranslatorBundle\Controller;


use JMS\TranslationBundle\Translation\ConfigFactory;
use JMS\TranslationBundle\Translation\LoaderManager;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class DefaultController extends \JMS\TranslationBundle\Controller\TranslateController
{

    public function __construct(ConfigFactory $configFactory, LoaderManager $loader)
    {
        parent::__construct($configFactory, $loader);
    }


    /**
     * @Route("/", name="maith_translation_index", options = {"i18n" = false})
     * @Template("@MaithCommonTranslator/Translate/index.html.twig")
     * @param Request $request
     * @return array
     */
    public function indexAction(Request $request)
    {

        return parent::indexAction($request);
    }
}
