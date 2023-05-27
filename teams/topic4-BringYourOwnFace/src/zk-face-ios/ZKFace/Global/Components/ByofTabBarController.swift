//
//  ByofTabBarController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/20.
//

import Foundation

//
//  MainTabBarController.swift
//  Wolley
//
//  Created by mac on 2022/01/11.
//

import UIKit

class ByofTabBarController: UITabBarController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        setProperty()
        setStyle()
    }
}

extension ByofTabBarController {
    private func setProperty() {
        viewControllers = [createOne(), createTwo(), createThree()] /// 탭바 뷰 연결
        selectedIndex = 0 /// 탭바 디폴트(시작) 뷰 설정
    }
    
    private func setStyle() {
        
        /// 탭바 색
        UITabBar.appearance().tintColor = .white

        if #available(iOS 15.0, *) {
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            
            UITabBar.appearance().backgroundColor = .black
        }
//        /// 탭바 아이콘 세로축 가운데 정렬
        if let items = self.tabBar.items {
            for item in items {
                item.title = nil
                item.imageInsets = UIEdgeInsets(top: 6, left: 0, bottom: -6, right: 0);
            }
        }
    }
    
    private func createOne() -> UINavigationController {
        let vc = HomeViewController()
        let navigationVC = UINavigationController(rootViewController: vc)
        
        vc.tabBarItem = UITabBarItem(title: "", image: UIImage(systemName: "dollarsign.circle.fill"), tag: 0)
        
        return navigationVC
    }
    
    private func createTwo() -> UINavigationController {
        let vc = SwapViewController()
        let navigationVC = UINavigationController(rootViewController: vc)
        
        vc.tabBarItem = UITabBarItem(title: "", image: UIImage(systemName: "repeat"), tag: 0)
        
        return navigationVC
    }
    
    private func createThree() -> UINavigationController {
        let vc = ConfigureProtocolViewController()
        let navigationVC = UINavigationController(rootViewController: vc)
        
        vc.tabBarItem = UITabBarItem(title: "", image: UIImage(systemName: "person.circle.fill"), tag: 0)
        
        return navigationVC
    }
}
