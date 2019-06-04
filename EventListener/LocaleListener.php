<?php

namespace Maith\Common\TranslatorBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
/**
 * Description of LocaleListener
 *
 * @author Rodrigo Santellan
 */
class LocaleListener implements EventSubscriberInterface
{
    private $defaultLocale;

    public function __construct($defaultLocale = 'es')
    {
        $this->defaultLocale = $defaultLocale;
    }
    
    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();
        if (!$request->hasPreviousSession()) {
            return;
        }
        //var_dump($request->attributes->get('_locale'));
        // try to see if the locale has been set as a _locale routing parameter
        //var_dump($request->attributes);
        //var_dump($request->get('_locale'));
        //var_dump($request->getLocale());
        //var_dump($request->get('_locale'));
        //var_dump($request->getSession()->get('_locale'));
        /*
        if (!is_null($request->get('_locale'))) {
            $request->setLocale($request->get('_locale'));
            $request->getSession()->set('_locale', $request->get('_locale'));
        } else {
            // if no explicit locale has been set on this request, use one from the session
            $request->setLocale($request->getSession()->get('_locale', $this->defaultLocale));
        }
        */
        if ($request->get('_locale') !== null) {
            $request->setLocale($request->get('_locale'));
            $request->getSession()->set('_locale', $request->get('_locale'));
        } else {
            // if no explicit locale has been set on this request, use one from the session
            $request->setLocale($request->getSession()->get('_locale', $this->defaultLocale));
        }
        //var_dump($request->getLocale());
    }
    
    public static function getSubscribedEvents() {
         return array(
            // must be registered before the default Locale listener
            KernelEvents::REQUEST => array(array('onKernelRequest', 17)),
        );
    }
}


