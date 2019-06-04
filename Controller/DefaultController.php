<?php

namespace Maith\Common\TranslatorBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Translation\MessageCatalogue;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\Request;

use Maith\Common\TranslatorBundle\Form\Type\GetTranslataionType;

class DefaultController extends Controller
{
    public function indexAction(Request $request)
    {
        $admin = $request->get('admin');
        $form = $this->retrieveGetTranslationForm($admin);
        return $this->render('MaithCommonTranslatorBundle:Default:index.html.twig', array('form' => $form->createView()));
    }
    
    private function retrieveGetTranslationForm($admin = null)
    {
      $list = array_merge(array('app'),$this->container->getParameter('translation_bundles'));
      if(!is_null($admin))
      {
        $list = array_merge($list, $this->container->getParameter('admin_translation_bundles'));
      }
      
      $bundlesList = array();
      foreach($list as $bundle){
        $bundlesList[$bundle] = $bundle;
      }
      $lang_list = $this->container->getParameter('translation_languages');
      $langs = array();
      foreach($lang_list as $value){
        $langs[$value] = $value;
      }
      $form = $this->createForm('Maith\Common\TranslatorBundle\Form\Type\GetTranslataionType', null, array(
        'bundles' => $bundlesList,
        'langs' => $langs,
      ));
      return $form;
    }
    
    public function getTranslationAction(Request $request){
        $response = new JsonResponse();
        $admin = $request->get('admin');
        $form = $this->retrieveGetTranslationForm($admin);
        $form->handleRequest($request);
        if ($form->isValid()) {
          $bundle = $form->get("bundle")->getData();
          $lang = $form->get("lang")->getData();
          $path = $this->getBundlePath($bundle);
          $loader = $this->get('translation.loader');
          $catalog = new MessageCatalogue($lang);
          $response = new JsonResponse();
          try
          {
            $loader->loadMessages($path, $catalog);
            $catalogData = $catalog->all("messages");
            $keyGroups = array();
            foreach($catalogData as $dataKey => $value )
            {
              $exploded = explode("_", $dataKey);
              $group = 'nogroup';
              if(isset($exploded[0]))
              {
                $group = $exploded[0];
              }
              if(!isset($keyGroups[$group]))
              {
                $keyGroups[$group] = array();
              }
              $keyGroups[$group][$dataKey] = $value;
            }
            $response->setData(array('status'=> 'OK', 'options' => array('html' => $this->renderView("MaithCommonTranslatorBundle:Default:showLangKeysValues.html.twig", array('bundle' => $bundle, 'lang' => $lang, 'translationGroups' => $keyGroups ,'translations' => $catalog->all("messages"))) )));
          }
          catch(\Exception $e)
          {
            $response->setData(array('status' => 'ERROR', 'options' => array('message' => $e->getMessage(), 'code' => $e->getCode())));
          }
        }else{
          $response->setData(array('status' => 'ERROR', 'options' => array('message' => 'Error en el formulario', 'code' => 1002892)));
        }
        return $response;
    }
    
    private function getBundlePath($bundle){
      if($bundle == 'app'){
        return $this->get('kernel')->getRootDir()."/Resources/translations";
      }else{
        return $this->get('kernel')->getBundle($bundle)->getPath()."/Resources/translations";
      }
    }
    
    public function setTranslationAction(){
        
        $bundle = $this->getRequest()->get("bundle");
        $lang = $this->getRequest()->get("lang");
        $key = $this->getRequest()->get("key");
        $value = $this->getRequest()->get("value");
        $path = $this->getBundlePath($bundle);
        $loader = $this->get('translation.loader');
        $catalog = new MessageCatalogue($lang);
        $loader->loadMessages($path, $catalog);
        $response = new JsonResponse();
        $messages_list = $catalog->all("messages");
        if(!isset($messages_list[$key]))
        {
          throw new NotFoundHttpException("Key not found");
        }
        $messages_list[$key] = $value;
        
        $catalog->replace($messages_list, 'messages');
        $writer = $this->get('translation.writer');
        $writer->writeTranslations($catalog, 'xlf', array('path' => $path));
        
        $response->setData(array('status' => 'OK'));
        return $response;
    }
    
    public function clearTranslationCacheAction(){
      
      $cacheDir = $this->get('kernel')->getRootDir().DIRECTORY_SEPARATOR."cache";
      $finder = new Finder();
      $finder->files()->in($cacheDir)->name("catalogue*");
      foreach($finder as $file)
      {
         @unlink($file->getRealpath());
      }
      $finderTwig = new Finder();
      $finderTwig->files()->in($cacheDir.DIRECTORY_SEPARATOR."*".DIRECTORY_SEPARATOR."twig");
      foreach($finderTwig as $file)
      {
         @unlink($file->getRealpath());
      }
      try
      {
        $finderHttpCache = new Finder();
        $finderHttpCache->files()->in($cacheDir.DIRECTORY_SEPARATOR."*".DIRECTORY_SEPARATOR."http_cache");
        foreach($finderHttpCache as $file)
        {
           @unlink($file->getRealpath());
        }
      }catch(\Exception $e)
      {
        
      }
      $response = new JsonResponse();
      $response->setData(array('status' => 'OK'));
      return $response;
    }
}
