//
//  EmbeddedWebViewController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/20.
//

import UIKit
import WebKit

class EmbeddedWebViewController: UIViewController {
    
    let isNavigationBarHidden: Bool
    let webUrl: String
    
    @IBOutlet weak var webView: WKWebView!
    
    init(webUrl: String, isNavigationBarHidden: Bool = false) {
        self.isNavigationBarHidden = isNavigationBarHidden
        self.webUrl = webUrl
        
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setLayout()
        setWebView()
    }
    
    @IBAction func onClickCamera(_ sender: Any) {
        //        let vc = FaceCameraViewController()
        //        navigationController?.pushViewController(vc, animated: true)
        
        sendMessageToWeb(type: .doneFaceRecognition)
    }
}

extension EmbeddedWebViewController {
    private func setLayout() {
        navigationController?.isNavigationBarHidden = isNavigationBarHidden
        navigationItem.title = "wallet1 (0x1287...dfd)"
    }
    
    private func setWebView() {
        let preferences = WKPreferences()
        preferences.javaScriptEnabled = true
        preferences.javaScriptCanOpenWindowsAutomatically = true
        
        let contentController = webView.configuration.userContentController
        contentController.add(self, name: "bridge")
        
        let configuration = WKWebViewConfiguration()
        configuration.preferences = preferences
        configuration.userContentController = contentController
        
        let userScript = WKUserScript(source: "test()", injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        contentController.addUserScript(userScript)
        
        let components = URLComponents(string: webUrl)!
        //        components.queryItems = [ URLQueryItem(name: "query", value: search) ]
        
        let request = URLRequest(url: components.url!)
        
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.load(request)
    }
    
    private func sendMessageToWeb(type: IosWebBridgeType) {
        switch type {
        case .doneFaceRecognition:
            webView.evaluateJavaScript("test()") { result, error in
                if let result = result {
                    print(result)
                }
                if let error = error {
                    print(error)
                }
            }
        }
    }
    
    private func receiveMessageFromWeb(type: WebIosBridgeType) {
        switch type {
        case .onClickImportYourWallet:
            print("onClickImportYourWallet")
            present(FaceCameraViewController(type: .wallet), animated: true)
        case .onClickCreateNewWallet:
            print("onClickCreateNewWallet")
            present(FaceCameraViewController(type: .wallet), animated: true)
        case .onClickSend:
            print("onClickSend")
            navigationController?.pushViewController(EmbeddedWebViewController(webUrl: ByofWebview.baseUrl + "/swap"), animated: true)
        case .onClickNext:
            print("onClickNext")
            navigationController?.pushViewController(EmbeddedWebViewController(webUrl: ByofWebview.baseUrl + "/confirm"), animated: true)
        case .onClickConfirm:
            print("onClickConfirm")
            let vc = FaceCameraViewController(type: .transaction)
            vc.parentVC = self
            present(vc, animated: true)
        }
    }
}

extension EmbeddedWebViewController: WKNavigationDelegate {
    
    public func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        
        print("\(navigationAction.request.url?.absoluteString ?? "")" )
        
        decisionHandler(.allow)
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            webView.isHidden = false
        }
    }
}

extension EmbeddedWebViewController: WKUIDelegate {
    
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let completionHandlerWrapper = CompletionHandlerWrapper(completionHandler: completionHandler, defaultValue: Void())
        /* custom UI */
        let alertController = UIAlertController(title: message, message: nil, preferredStyle: .alert)
        alertController.addAction(UIAlertAction(title: "확인", style: .default) { _ in
            print("확인")
        })
        alertController.addAction(UIAlertAction(title: "취소", style: .cancel) { _ in
            print("취소")
        })
        present(alertController, animated: true, completion: nil)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let completionHandlerWrapper = CompletionHandlerWrapper(completionHandler: completionHandler, defaultValue: false)
        let alertController = UIAlertController(title: message, message: nil, preferredStyle: .alert)
        alertController.addAction(UIAlertAction(title: "확인", style: .default) { _ in completionHandlerWrapper.respondHandler(true) })
        alertController.addAction(UIAlertAction(title: "취소", style: .cancel) { _ in completionHandlerWrapper.respondHandler(false) })
        present(alertController, animated: true, completion: nil)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        let completionHandlerWrapper = CompletionHandlerWrapper(completionHandler: completionHandler, defaultValue: "")
        /* custom UI */
    }
    
}

extension EmbeddedWebViewController: WKScriptMessageHandler {
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print(message.name)
        
        if message.name == "bridge", let messageBody = message.body as? String {
            // Handle the message from the web app
            print("Received message from Next.js web app:", messageBody)
            
            if let type = WebIosBridgeType(rawValue: messageBody) {
                receiveMessageFromWeb(type: type)
            }
        }
    }
}

class CompletionHandlerWrapper<Element> {
    private var completionHandler: ((Element) -> Void)?
    private let defaultValue: Element
    
    init(completionHandler: @escaping ((Element) -> Void), defaultValue: Element) {
        self.completionHandler = completionHandler
        self.defaultValue = defaultValue
    }
    
    func respondHandler(_ value: Element) {
        completionHandler?(value)
        completionHandler = nil
    }
    
    deinit {
        respondHandler(defaultValue)
    }
}
